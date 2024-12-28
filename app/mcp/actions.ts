"use server";

import { createClient, executeRequest } from "./client";
import { MCPClientLogger } from "./logger";
import { MCP_CONF } from "@/app/mcp/mcp_config";

const logger = new MCPClientLogger("MCP Server");

let fsClient: any = null;

async function initFileSystemClient() {
  if (!fsClient) {
    fsClient = await createClient(MCP_CONF.filesystem, "fs");
    logger.success("FileSystem client initialized");
  }
  return fsClient;
}

export async function executeMcpAction(request: any) {
  "use server";

  try {
    if (!fsClient) {
      await initFileSystemClient();
    }

    logger.info("Executing MCP request for fs");
    return await executeRequest(fsClient, request);
  } catch (error) {
    logger.error(`MCP execution error: ${error}`);
    throw error;
  }
}
