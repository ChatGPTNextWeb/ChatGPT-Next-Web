import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  getDefaultEnvironment,
  StdioClientTransport,
} from "@modelcontextprotocol/sdk/client/stdio.js";
import { MCPClientLogger } from "./logger";
import { ListToolsResponse, McpRequestMessage, ServerConfig } from "./types";
import { z } from "zod";

const logger = new MCPClientLogger();

export function getMcpChildEnvironment(
  configEnv?: Record<string, string>,
): Record<string, string> {
  return {
    ...getDefaultEnvironment(),
    ...(configEnv ?? {}),
  };
}

export async function createClient(
  id: string,
  config: ServerConfig,
): Promise<Client> {
  logger.info(`Creating client for ${id}...`);

  const transport = new StdioClientTransport({
    command: config.command,
    args: config.args,
    env: getMcpChildEnvironment(config.env),
  });

  const client = new Client(
    {
      name: `nextchat-mcp-client-${id}`,
      version: "1.0.0",
    },
    {
      capabilities: {},
    },
  );
  await client.connect(transport);
  return client;
}

export async function removeClient(client: Client) {
  logger.info(`Removing client...`);
  await client.close();
}

export async function listTools(client: Client): Promise<ListToolsResponse> {
  return client.listTools();
}

export async function executeRequest(
  client: Client,
  request: McpRequestMessage,
) {
  return client.request(request, z.any());
}
