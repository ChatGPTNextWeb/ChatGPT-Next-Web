import { ToolApi, getHeaders } from "../api";

export class DuckDuckGoSearch implements ToolApi {
  name = "duckduckgo_search";
  description =
    "A wrapper around DuckDuckGo Search.Useful for when you need to answer questions about current events.Input should be a search query.";

  async call(input: string): Promise<string> {
    const res = await fetch(`/api/tools/ddg?query=${input}`, {
      method: "GET",
      headers: getHeaders(),
    });
    return await res.json();
  }
}
