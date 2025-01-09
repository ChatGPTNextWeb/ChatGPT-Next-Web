"use server";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  createClient,
  executeRequest,
  listPrimitives,
  Primitive,
} from "./client";
import { MCPClientLogger } from "./logger";
import conf from "./mcp_config.json";
import { McpRequestMessage } from "./types";

const logger = new MCPClientLogger("MCP Actions");

// Use Map to store all clients
const clientsMap = new Map<
  string,
  { client: Client; primitives: Primitive[] }
>();

// Whether initialized
let initialized = false;

// Store failed clients
let errorClients: string[] = [];

// Initialize all configured clients
export async function initializeMcpClients() {
  // If already initialized, return
  if (initialized) {
    return;
  }

  logger.info("Starting to initialize MCP clients...");

  // Initialize all clients, key is clientId, value is client config
  for (const [clientId, config] of Object.entries(conf.mcpServers)) {
    try {
      logger.info(`Initializing MCP client: ${clientId}`);
      const client = await createClient(config, clientId);
      const primitives = await listPrimitives(client);
      clientsMap.set(clientId, { client, primitives });
      logger.success(
        `Client [${clientId}] initialized, ${primitives.length} primitives supported`,
      );
    } catch (error) {
      errorClients.push(clientId);
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
  return Array.from(clientsMap.keys()).filter(
    (clientId) => !errorClients.includes(clientId),
  );
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
