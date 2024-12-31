import { createClient, listPrimitives } from "@/app/mcp/client";
import { MCPClientLogger } from "@/app/mcp/logger";
import conf from "./mcp_config.json";

const logger = new MCPClientLogger("MCP Server Example", true);

async function main() {
  logger.info("Connecting to server...");

  const client = await createClient(conf.mcpServers.everything, "everything");
  const primitives = await listPrimitives(client);

  logger.success(`Connected to server everything`);

  logger.info(
    `server capabilities: ${Object.keys(
      client.getServerCapabilities() ?? [],
    ).join(", ")}`,
  );

  logger.info("Server supports the following primitives:");

  primitives.forEach((primitive) => {
    logger.info("\n" + JSON.stringify(primitive, null, 2));
  });
}

main().catch((error) => {
  logger.error(error);
  process.exit(1);
});
