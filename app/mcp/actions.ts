"use server";
import {
  createClient,
  executeRequest,
  listTools,
  removeClient,
} from "./client";
import { MCPClientLogger } from "./logger";
import {
  DEFAULT_MCP_CONFIG,
  McpClientData,
  McpConfigData,
  McpRequestMessage,
  ServerConfig,
  ServerStatusResponse,
} from "./types";
import fs from "fs/promises";
import path from "path";
import md5 from "spark-md5";

const logger = new MCPClientLogger("MCP Actions");
const CONFIG_PATH = path.join(process.cwd(), "app/mcp/mcp_config.json");

const clientsMap = new Map<string, McpClientData>();

// Every exported function in this "use server" module is directly callable over
// HTTP. MCP therefore requires both an explicit feature flag and a configured,
// valid deployment access code before exposing config or starting child processes.
async function assertMcpAuthorized(accessCode: string) {
  if (!(await isMcpEnabled())) {
    throw new Error("MCP is not enabled");
  }

  const allowedCodes = new Set(
    (process.env.CODE ?? "")
      .split(",")
      .map((code) => code.trim())
      .filter(Boolean)
      .map((code) => md5.hash(code)),
  );

  if (allowedCodes.size === 0) {
    throw new Error("MCP requires CODE to be configured");
  }

  if (!accessCode || !allowedCodes.has(md5.hash(accessCode.trim()))) {
    throw new Error("Unauthorized MCP request");
  }
}

// 获取客户端状态
export async function getClientsStatus(
  accessCode: string,
): Promise<Record<string, ServerStatusResponse>> {
  await assertMcpAuthorized(accessCode);
  const config = await getMcpConfigFromFile(accessCode);
  const result: Record<string, ServerStatusResponse> = {};

  for (const clientId of Object.keys(config.mcpServers)) {
    const status = clientsMap.get(clientId);
    const serverConfig = config.mcpServers[clientId];

    if (!serverConfig) {
      result[clientId] = { status: "undefined", errorMsg: null };
      continue;
    }

    if (serverConfig.status === "paused") {
      result[clientId] = { status: "paused", errorMsg: null };
      continue;
    }

    if (!status) {
      result[clientId] = { status: "undefined", errorMsg: null };
      continue;
    }

    if (
      status.client === null &&
      status.tools === null &&
      status.errorMsg === null
    ) {
      result[clientId] = { status: "initializing", errorMsg: null };
      continue;
    }

    if (status.errorMsg) {
      result[clientId] = { status: "error", errorMsg: status.errorMsg };
      continue;
    }

    if (status.client) {
      result[clientId] = { status: "active", errorMsg: null };
      continue;
    }

    result[clientId] = { status: "error", errorMsg: "Client not found" };
  }

  return result;
}

// 获取客户端工具
export async function getClientTools(clientId: string, accessCode: string) {
  await assertMcpAuthorized(accessCode);
  return clientsMap.get(clientId)?.tools ?? null;
}

// 获取可用客户端数量
export async function getAvailableClientsCount(accessCode: string) {
  await assertMcpAuthorized(accessCode);
  let count = 0;
  clientsMap.forEach((map) => !map.errorMsg && count++);
  return count;
}

// 获取所有客户端工具
export async function getAllTools(accessCode: string) {
  await assertMcpAuthorized(accessCode);
  const result = [];
  for (const [clientId, status] of clientsMap.entries()) {
    result.push({
      clientId,
      tools: status.tools,
    });
  }
  return result;
}

// 初始化单个客户端
async function initializeSingleClient(
  clientId: string,
  serverConfig: ServerConfig,
) {
  // 如果服务器状态是暂停，则不初始化
  if (serverConfig.status === "paused") {
    logger.info(`Skipping initialization for paused client [${clientId}]`);
    return;
  }

  logger.info(`Initializing client [${clientId}]...`);

  // 先设置初始化状态
  clientsMap.set(clientId, {
    client: null,
    tools: null,
    errorMsg: null, // null 表示正在初始化
  });

  // 异步初始化
  createClient(clientId, serverConfig)
    .then(async (client) => {
      const tools = await listTools(client);
      logger.info(
        `Supported tools for [${clientId}]: ${JSON.stringify(tools, null, 2)}`,
      );
      clientsMap.set(clientId, { client, tools, errorMsg: null });
      logger.success(`Client [${clientId}] initialized successfully`);
    })
    .catch((error) => {
      clientsMap.set(clientId, {
        client: null,
        tools: null,
        errorMsg: error instanceof Error ? error.message : String(error),
      });
      logger.error(`Failed to initialize client [${clientId}]: ${error}`);
    });
}

// 初始化系统
export async function initializeMcpSystem(accessCode: string) {
  await assertMcpAuthorized(accessCode);
  logger.info("MCP Actions starting...");
  try {
    // 检查是否已有活跃的客户端
    if (clientsMap.size > 0) {
      logger.info("MCP system already initialized, skipping...");
      return;
    }

    const config = await getMcpConfigFromFile(accessCode);
    // 初始化所有客户端
    for (const [clientId, serverConfig] of Object.entries(config.mcpServers)) {
      await initializeSingleClient(clientId, serverConfig);
    }
    return config;
  } catch (error) {
    logger.error(`Failed to initialize MCP system: ${error}`);
    throw error;
  }
}

// 添加服务器
export async function addMcpServer(
  clientId: string,
  config: ServerConfig,
  accessCode: string,
) {
  await assertMcpAuthorized(accessCode);
  try {
    const currentConfig = await getMcpConfigFromFile(accessCode);
    const isNewServer = !(clientId in currentConfig.mcpServers);

    // 如果是新服务器，设置默认状态为 active
    if (isNewServer && !config.status) {
      config.status = "active";
    }

    const newConfig = {
      ...currentConfig,
      mcpServers: {
        ...currentConfig.mcpServers,
        [clientId]: config,
      },
    };
    await updateMcpConfig(newConfig);

    // 只有新服务器或状态为 active 的服务器才初始化
    if (isNewServer || config.status === "active") {
      await initializeSingleClient(clientId, config);
    }

    return newConfig;
  } catch (error) {
    logger.error(`Failed to add server [${clientId}]: ${error}`);
    throw error;
  }
}

// 暂停服务器
export async function pauseMcpServer(clientId: string, accessCode: string) {
  await assertMcpAuthorized(accessCode);
  try {
    const currentConfig = await getMcpConfigFromFile(accessCode);
    const serverConfig = currentConfig.mcpServers[clientId];
    if (!serverConfig) {
      throw new Error(`Server ${clientId} not found`);
    }

    // 先更新配置
    const newConfig: McpConfigData = {
      ...currentConfig,
      mcpServers: {
        ...currentConfig.mcpServers,
        [clientId]: {
          ...serverConfig,
          status: "paused",
        },
      },
    };
    await updateMcpConfig(newConfig);

    // 然后关闭客户端
    const client = clientsMap.get(clientId);
    if (client?.client) {
      await removeClient(client.client);
    }
    clientsMap.delete(clientId);

    return newConfig;
  } catch (error) {
    logger.error(`Failed to pause server [${clientId}]: ${error}`);
    throw error;
  }
}

// 恢复服务器
export async function resumeMcpServer(
  clientId: string,
  accessCode: string,
): Promise<void> {
  await assertMcpAuthorized(accessCode);
  try {
    const currentConfig = await getMcpConfigFromFile(accessCode);
    const serverConfig = currentConfig.mcpServers[clientId];
    if (!serverConfig) {
      throw new Error(`Server ${clientId} not found`);
    }

    // 先尝试初始化客户端
    logger.info(`Trying to initialize client [${clientId}]...`);
    try {
      const client = await createClient(clientId, serverConfig);
      const tools = await listTools(client);
      clientsMap.set(clientId, { client, tools, errorMsg: null });
      logger.success(`Client [${clientId}] initialized successfully`);

      // 初始化成功后更新配置
      const newConfig: McpConfigData = {
        ...currentConfig,
        mcpServers: {
          ...currentConfig.mcpServers,
          [clientId]: {
            ...serverConfig,
            status: "active" as const,
          },
        },
      };
      await updateMcpConfig(newConfig);
    } catch (error) {
      const currentConfig = await getMcpConfigFromFile(accessCode);
      const serverConfig = currentConfig.mcpServers[clientId];

      // 如果配置中存在该服务器，则更新其状态为 error
      if (serverConfig) {
        serverConfig.status = "error";
        await updateMcpConfig(currentConfig);
      }

      // 初始化失败
      clientsMap.set(clientId, {
        client: null,
        tools: null,
        errorMsg: error instanceof Error ? error.message : String(error),
      });
      logger.error(`Failed to initialize client [${clientId}]: ${error}`);
      throw error;
    }
  } catch (error) {
    logger.error(`Failed to resume server [${clientId}]: ${error}`);
    throw error;
  }
}

// 移除服务器
export async function removeMcpServer(clientId: string, accessCode: string) {
  await assertMcpAuthorized(accessCode);
  try {
    const currentConfig = await getMcpConfigFromFile(accessCode);
    const { [clientId]: _, ...rest } = currentConfig.mcpServers;
    const newConfig = {
      ...currentConfig,
      mcpServers: rest,
    };
    await updateMcpConfig(newConfig);

    // 关闭并移除客户端
    const client = clientsMap.get(clientId);
    if (client?.client) {
      await removeClient(client.client);
    }
    clientsMap.delete(clientId);

    return newConfig;
  } catch (error) {
    logger.error(`Failed to remove server [${clientId}]: ${error}`);
    throw error;
  }
}

// 重启所有客户端
export async function restartAllClients(accessCode: string) {
  await assertMcpAuthorized(accessCode);
  logger.info("Restarting all clients...");
  try {
    // 关闭所有客户端
    for (const client of clientsMap.values()) {
      if (client.client) {
        await removeClient(client.client);
      }
    }

    // 清空状态
    clientsMap.clear();

    // 重新初始化
    const config = await getMcpConfigFromFile(accessCode);
    for (const [clientId, serverConfig] of Object.entries(config.mcpServers)) {
      await initializeSingleClient(clientId, serverConfig);
    }
    return config;
  } catch (error) {
    logger.error(`Failed to restart clients: ${error}`);
    throw error;
  }
}

// 执行 MCP 请求
export async function executeMcpAction(
  clientId: string,
  request: McpRequestMessage,
  accessCode: string,
) {
  await assertMcpAuthorized(accessCode);
  try {
    const client = clientsMap.get(clientId);
    if (!client?.client) {
      throw new Error(`Client ${clientId} not found`);
    }
    logger.info(`Executing request for [${clientId}]`);
    return await executeRequest(client.client, request);
  } catch (error) {
    logger.error(`Failed to execute request for [${clientId}]: ${error}`);
    throw error;
  }
}

// 获取 MCP 配置文件
export async function getMcpConfigFromFile(
  accessCode: string,
): Promise<McpConfigData> {
  await assertMcpAuthorized(accessCode);
  try {
    const configStr = await fs.readFile(CONFIG_PATH, "utf-8");
    return JSON.parse(configStr);
  } catch (error) {
    logger.error(`Failed to load MCP config, using default config: ${error}`);
    return DEFAULT_MCP_CONFIG;
  }
}

// 更新 MCP 配置文件
async function updateMcpConfig(config: McpConfigData): Promise<void> {
  try {
    // 确保目录存在
    await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
  } catch (error) {
    throw error;
  }
}

// 检查 MCP 是否启用
export async function isMcpEnabled() {
  return process.env.ENABLE_MCP === "true";
}
