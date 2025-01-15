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
} from "./types";
import fs from "fs/promises";
import path from "path";

const logger = new MCPClientLogger("MCP Actions");
const CONFIG_PATH = path.join(process.cwd(), "app/mcp/mcp_config.json");

const clientsMap = new Map<string, McpClientData>();

// 获取客户端状态
export async function getClientStatus(clientId: string) {
  const status = clientsMap.get(clientId);
  if (!status) return { status: "undefined" as const, errorMsg: null };

  return {
    status: status.errorMsg ? ("error" as const) : ("active" as const),
    errorMsg: status.errorMsg,
  };
}

// 获取客户端工具
export async function getClientTools(clientId: string) {
  return clientsMap.get(clientId)?.tools ?? null;
}

// 获取可用客户端数量
export async function getAvailableClientsCount() {
  let count = 0;
  clientsMap.forEach((map) => {
    if (!map.errorMsg) {
      count += map?.tools?.tools?.length ?? 0;
    }
  });
  return count;
}

// 获取所有客户端工具
export async function getAllTools() {
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
  logger.info(`Initializing client [${clientId}]...`);
  try {
    const client = await createClient(clientId, serverConfig);
    const tools = await listTools(client);
    clientsMap.set(clientId, { client, tools, errorMsg: null });
    logger.success(`Client [${clientId}] initialized successfully`);
  } catch (error) {
    clientsMap.set(clientId, {
      client: null,
      tools: null,
      errorMsg: error instanceof Error ? error.message : String(error),
    });
    logger.error(`Failed to initialize client [${clientId}]: ${error}`);
  }
}

// 初始化系统
export async function initializeMcpSystem() {
  logger.info("MCP Actions starting...");
  try {
    const config = await getMcpConfigFromFile();
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
export async function addMcpServer(clientId: string, config: ServerConfig) {
  try {
    const currentConfig = await getMcpConfigFromFile();
    const newConfig = {
      ...currentConfig,
      mcpServers: {
        ...currentConfig.mcpServers,
        [clientId]: config,
      },
    };
    await updateMcpConfig(newConfig);
    // 只初始化新添加的服务器
    await initializeSingleClient(clientId, config);
    return newConfig;
  } catch (error) {
    logger.error(`Failed to add server [${clientId}]: ${error}`);
    throw error;
  }
}

// 移除服务器
export async function removeMcpServer(clientId: string) {
  try {
    const currentConfig = await getMcpConfigFromFile();
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
export async function restartAllClients() {
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
    const config = await getMcpConfigFromFile();
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
) {
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
export async function getMcpConfigFromFile(): Promise<McpConfigData> {
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
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
  } catch (error) {
    throw error;
  }
}

// 重新初始化单个客户端
export async function reinitializeClient(clientId: string) {
  const config = await getMcpConfigFromFile();
  const serverConfig = config.mcpServers[clientId];
  if (!serverConfig) {
    throw new Error(`Server config not found for client ${clientId}`);
  }
  await initializeSingleClient(clientId, serverConfig);
}
