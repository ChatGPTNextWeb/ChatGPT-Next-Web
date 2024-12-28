import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { MCPClientLogger } from "./logger";
import { z } from "zod";

export interface ServerConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

const logger = new MCPClientLogger();

export async function createClient(
  serverConfig: ServerConfig,
  name: string,
): Promise<Client> {
  logger.info(`Creating client for server ${name}`);

  const transport = new StdioClientTransport({
    command: serverConfig.command,
    args: serverConfig.args,
    env: serverConfig.env,
  });
  const client = new Client(
    {
      name: `nextchat-mcp-client-${name}`,
      version: "1.0.0",
    },
    {
      capabilities: {
        roots: {
          // listChanged indicates whether the client will emit notifications when the list of roots changes.
          // listChanged 指示客户端在根列表更改时是否发出通知。
          listChanged: true,
        },
      },
    },
  );
  await client.connect(transport);
  return client;
}

interface Primitive {
  type: "resource" | "tool" | "prompt";
  value: any;
}

/** List all resources, tools, and prompts */
export async function listPrimitives(client: Client) {
  const capabilities = client.getServerCapabilities();
  const primitives: Primitive[] = [];
  const promises = [];
  if (capabilities?.resources) {
    promises.push(
      client.listResources().then(({ resources }) => {
        resources.forEach((item) =>
          primitives.push({ type: "resource", value: item }),
        );
      }),
    );
  }
  if (capabilities?.tools) {
    promises.push(
      client.listTools().then(({ tools }) => {
        tools.forEach((item) => primitives.push({ type: "tool", value: item }));
      }),
    );
  }
  if (capabilities?.prompts) {
    promises.push(
      client.listPrompts().then(({ prompts }) => {
        prompts.forEach((item) =>
          primitives.push({ type: "prompt", value: item }),
        );
      }),
    );
  }
  await Promise.all(promises);
  return primitives;
}

export async function executeRequest(client: Client, request: any) {
  const r = client.request(request, z.any());
  console.log(r);
  return r;
}
