export function isMcpJson(content: string) {
  return content.match(/```json:mcp:(\w+)([\s\S]*?)```/);
}

export function extractMcpJson(content: string) {
  const match = content.match(/```json:mcp:(\w+)([\s\S]*?)```/);
  if (match) {
    return { clientId: match[1], mcp: JSON.parse(match[2]) };
  }
  return null;
}
