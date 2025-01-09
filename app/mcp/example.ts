import { createClient, listPrimitives } from "@/app/mcp/client";
import { MCPClientLogger } from "@/app/mcp/logger";
import conf from "./mcp_config.json";

const logger = new MCPClientLogger("MCP Server Example", true);

const TEST_SERVER = "everything";

async function main() {
  logger.info(`All MCP servers: ${Object.keys(conf.mcpServers).join(", ")}`);

  logger.info(`Connecting to server ${TEST_SERVER}...`);

  const client = await createClient(conf.mcpServers[TEST_SERVER], TEST_SERVER);
  const primitives = await listPrimitives(client);

  logger.success(`Connected to server ${TEST_SERVER}`);

  logger.info(
    `${TEST_SERVER} supported primitives:\n${JSON.stringify(
      primitives.filter((i) => i.type === "tool"),
      null,
      2,
    )}`,
  );
}

main().catch((error) => {
  logger.error(error);
  process.exit(1);
});
