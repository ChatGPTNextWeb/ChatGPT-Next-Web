import { createClient, listTools } from "@/app/mcp/client";
import { MCPClientLogger } from "@/app/mcp/logger";
import conf from "./mcp_config.json";

const logger = new MCPClientLogger("MCP Server Example", true);

const TEST_SERVER = "filesystem";

async function main() {
  logger.info(`All MCP servers: ${Object.keys(conf.mcpServers).join(", ")}`);

  logger.info(`Connecting to server ${TEST_SERVER}...`);

  const client = await createClient(TEST_SERVER, conf.mcpServers[TEST_SERVER]);
  const tools = await listTools(client);

  logger.success(`Connected to server ${TEST_SERVER}`);

  logger.info(
    `${TEST_SERVER} supported primitives:\n${JSON.stringify(tools, null, 2)}`,
  );
}

main().catch((error) => {
  logger.error(error);
  process.exit(1);
});
