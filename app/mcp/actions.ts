"use server";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  createClient,
  executeRequest,
  listPrimitives,
  Primitive,
} from "./client";
import { MCPClientLogger } from "./logger";
import { McpRequestMessage, McpConfig, ServerConfig } from "./types";
import fs from "fs/promises";
import path from "path";

const logger = new MCPClientLogger("MCP Actions");

// Use Map to store all clients
const clientsMap = new Map<
  string,
  { client: Client | null; primitives: Primitive[]; errorMsg: string | null }
>();

// Whether initialized
let initialized = false;

// Store failed clients
let errorClients: string[] = [];

const CONFIG_PATH = path.join(process.cwd(), "app/mcp/mcp_config.json");

// 获取 MCP 配置
export async function getMcpConfig(): Promise<McpConfig> {
  try {
    const configStr = await fs.readFile(CONFIG_PATH, "utf-8");
    return JSON.parse(configStr);
  } catch (error) {
    console.error("Failed to read MCP config:", error);
    return { mcpServers: {} };
  }
}

// 更新 MCP 配置
export async function updateMcpConfig(config: McpConfig): Promise<void> {
  try {
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error("Failed to write MCP config:", error);
    throw error;
  }
}

// 重新初始化所有客户端
export async function reinitializeMcpClients() {
  logger.info("Reinitializing MCP clients...");
  // 遍历所有客户端，关闭
  try {
    for (const [clientId, clientData] of clientsMap.entries()) {
      clientData.client?.close();
    }
  } catch (error) {
    logger.error(`Failed to close clients: ${error}`);
  }
  // 清空状态
  clientsMap.clear();
  errorClients = [];
  initialized = false;
  // 重新初始化
  return initializeMcpClients();
}

// Initialize all configured clients
export async function initializeMcpClients() {
  // If already initialized, return
  if (initialized) {
    return { errorClients };
  }

  logger.info("Starting to initialize MCP clients...");
  errorClients = [];

  const config = await getMcpConfig();
  // Initialize all clients, key is clientId, value is client config
  for (const [clientId, serverConfig] of Object.entries(config.mcpServers)) {
    try {
      logger.info(`Initializing MCP client: ${clientId}`);
      const client = await createClient(serverConfig as ServerConfig, clientId);
      const primitives = await listPrimitives(client);
      clientsMap.set(clientId, { client, primitives, errorMsg: null });
      logger.success(
        `Client [${clientId}] initialized, ${primitives.length} primitives supported`,
      );
    } catch (error) {
      errorClients.push(clientId);
      clientsMap.set(clientId, {
        client: null,
        primitives: [],
        errorMsg: error instanceof Error ? error.message : String(error),
      });
      logger.error(`Failed to initialize client ${clientId}: ${error}`);
    }
  }

  initialized = true;

  if (errorClients.length > 0) {
    logger.warn(`Failed to initialize clients: ${errorClients.join(", ")}`);
  } else {
    logger.success("All MCP clients initialized");
  }

  const availableClients = await getAvailableClients();
  logger.info(`Available clients: ${availableClients.join(",")}`);

  return { errorClients };
}

// Execute MCP request
export async function executeMcpAction(
  clientId: string,
  request: McpRequestMessage,
) {
  try {
    // Find the corresponding client
    const client = clientsMap.get(clientId)?.client;
    if (!client) {
      logger.error(`Client ${clientId} not found`);
      return;
    }

    logger.info(`Executing MCP request for ${clientId}`);

    // Execute request and return result
    return await executeRequest(client, request);
  } catch (error) {
    logger.error(`MCP execution error: ${error}`);
    throw error;
  }
}

// Get all available client IDs
export async function getAvailableClients() {
  return Array.from(clientsMap.entries())
    .filter(([_, data]) => data.errorMsg === null)
    .map(([clientId]) => clientId);
}

// Get all primitives from all clients
export async function getAllPrimitives(): Promise<
  {
    clientId: string;
    primitives: Primitive[];
  }[]
> {
  return Array.from(clientsMap.entries()).map(([clientId, { primitives }]) => ({
    clientId,
    primitives,
  }));
}

// 获取客户端的 Primitives
export async function getClientPrimitives(clientId: string) {
  try {
    const clientData = clientsMap.get(clientId);
    if (!clientData) {
      console.warn(`Client ${clientId} not found in map`);
      return null;
    }
    if (clientData.errorMsg) {
      console.warn(`Client ${clientId} has error: ${clientData.errorMsg}`);
      return null;
    }
    return clientData.primitives;
  } catch (error) {
    console.error(`Failed to get primitives for client ${clientId}:`, error);
    return null;
  }
}

// 重启所有客户端
export async function restartAllClients() {
  logger.info("Restarting all MCP clients...");

  // 清空状态
  clientsMap.clear();
  errorClients = [];
  initialized = false;

  // 重新初始化
  await initializeMcpClients();

  return {
    success: errorClients.length === 0,
    errorClients,
  };
}

// 获取所有客户端状态
export async function getAllClientStatus(): Promise<
  Record<string, string | null>
> {
  const status: Record<string, string | null> = {};
  for (const [clientId, data] of clientsMap.entries()) {
    status[clientId] = data.errorMsg;
  }
  return status;
}

// 检查客户端状态
export async function getClientErrors(): Promise<
  Record<string, string | null>
> {
  const errors: Record<string, string | null> = {};
  for (const [clientId, data] of clientsMap.entries()) {
    errors[clientId] = data.errorMsg;
  }
  return errors;
}

// 获取客户端状态，不重新初始化
export async function refreshClientStatus() {
  logger.info("Refreshing client status...");

  // 如果还没初始化过，则初始化
  if (!initialized) {
    return initializeMcpClients();
  }

  // 否则只更新错误状态
  errorClients = [];
  for (const [clientId, clientData] of clientsMap.entries()) {
    if (clientData.errorMsg !== null) {
      errorClients.push(clientId);
    }
  }

  return { errorClients };
}
