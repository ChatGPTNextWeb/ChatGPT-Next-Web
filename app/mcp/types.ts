// ref: https://spec.modelcontextprotocol.io/specification/basic/messages/

import { z } from "zod";

export interface McpRequestMessage {
  jsonrpc?: "2.0";
  id?: string | number;
  method: "tools/call" | string;
  params?: {
    [key: string]: unknown;
  };
}

export const McpRequestMessageSchema: z.ZodType<McpRequestMessage> = z.object({
  jsonrpc: z.literal("2.0").optional(),
  id: z.union([z.string(), z.number()]).optional(),
  method: z.string(),
  params: z.record(z.unknown()).optional(),
});

export interface McpResponseMessage {
  jsonrpc?: "2.0";
  id?: string | number;
  result?: {
    [key: string]: unknown;
  };
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export const McpResponseMessageSchema: z.ZodType<McpResponseMessage> = z.object(
  {
    jsonrpc: z.literal("2.0").optional(),
    id: z.union([z.string(), z.number()]).optional(),
    result: z.record(z.unknown()).optional(),
    error: z
      .object({
        code: z.number(),
        message: z.string(),
        data: z.unknown().optional(),
      })
      .optional(),
  },
);

export interface McpNotifications {
  jsonrpc?: "2.0";
  method: string;
  params?: {
    [key: string]: unknown;
  };
}

export const McpNotificationsSchema: z.ZodType<McpNotifications> = z.object({
  jsonrpc: z.literal("2.0").optional(),
  method: z.string(),
  params: z.record(z.unknown()).optional(),
});

// MCP 服务器配置相关类型
export interface ServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export interface McpConfig {
  mcpServers: Record<string, ServerConfig>;
}

export interface ArgsMapping {
  type: "spread" | "single" | "env";
  position?: number;
  key?: string;
}

export interface PresetServer {
  id: string;
  name: string;
  description: string;
  command: string;
  baseArgs: string[];
  configurable: boolean;
  configSchema?: {
    properties: Record<
      string,
      {
        type: string;
        description?: string;
        required?: boolean;
        minItems?: number;
      }
    >;
  };
  argsMapping?: Record<string, ArgsMapping>;
}
