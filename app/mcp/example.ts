import { createClient, listPrimitives } from "@/app/mcp/client";
import { MCPClientLogger } from "@/app/mcp/logger";
import { z } from "zod";
import { MCP_CONF } from "@/app/mcp/mcp_config";

const logger = new MCPClientLogger("MCP FS Example", true);

const ListAllowedDirectoriesResultSchema = z.object({
  content: z.array(
    z.object({
      type: z.string(),
      text: z.string(),
    }),
  ),
});

const ReadFileResultSchema = z.object({
  content: z.array(
    z.object({
      type: z.string(),
      text: z.string(),
    }),
  ),
});

async function main() {
  logger.info("Connecting to server...");

  const client = await createClient(MCP_CONF.filesystem, "fs");
  const primitives = await listPrimitives(client);

  logger.success(`Connected to server fs`);

  logger.info(
    `server capabilities: ${Object.keys(
      client.getServerCapabilities() ?? [],
    ).join(", ")}`,
  );

  logger.debug("Server supports the following primitives:");

  primitives.forEach((primitive) => {
    logger.debug("\n" + JSON.stringify(primitive, null, 2));
  });

  const listAllowedDirectories = async () => {
    const result = await client.request(
      {
        method: "tools/call",
        params: {
          name: "list_allowed_directories",
          arguments: {},
        },
      },
      ListAllowedDirectoriesResultSchema,
    );
    logger.success(`Allowed directories: ${result.content[0].text}`);
    return result;
  };

  const readFile = async (path: string) => {
    const result = await client.request(
      {
        method: "tools/call",
        params: {
          name: "read_file",
          arguments: {
            path: path,
          },
        },
      },
      ReadFileResultSchema,
    );
    logger.success(`File contents for ${path}:\n${result.content[0].text}`);
    return result;
  };

  try {
    logger.info("Example 1: List allowed directories\n");
    await listAllowedDirectories();

    logger.info("\nExample 2: Read a file\n");
    await readFile("/users/kadxy/desktop/test.txt");
  } catch (error) {
    logger.error(`Error executing examples: ${error}`);
  }
}

main().catch((error) => {
  logger.error(error);
  process.exit(1);
});
