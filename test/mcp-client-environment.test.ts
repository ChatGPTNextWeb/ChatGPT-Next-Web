import { getMcpChildEnvironment } from "../app/mcp/client";

describe("MCP child process environment", () => {
  const ORIGINAL_OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  afterEach(() => {
    if (ORIGINAL_OPENAI_API_KEY === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = ORIGINAL_OPENAI_API_KEY;
    }
  });

  test("does not inherit application secrets", () => {
    process.env.OPENAI_API_KEY = "should-not-be-inherited";

    const env = getMcpChildEnvironment({
      MCP_SERVER_TOKEN: "explicit-server-token",
    });

    expect(env.OPENAI_API_KEY).toBeUndefined();
    expect(env.MCP_SERVER_TOKEN).toBe("explicit-server-token");
  });
});
