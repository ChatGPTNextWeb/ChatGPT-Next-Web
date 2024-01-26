import { SafeSearchType, search } from "duck-duck-scrape";
import { convert as htmlToText } from "html-to-text";
import { Tool } from "@langchain/core/tools";

export class DuckDuckGo extends Tool {
  name = "duckduckgo_search";
  maxResults = 4;

  /** @ignore */
  async _call(input: string) {
    const searchResults = await search(input, {
      safeSearch: SafeSearchType.OFF,
    });

    if (searchResults.noResults) {
      return "No good search result found";
    }

    const results = searchResults.results
      .slice(0, this.maxResults)
      .map(({ title, description, url }) => htmlToText(description))
      .join("\n\n");

    return results;
  }

  description =
    "a search engine. useful for when you need to answer questions about current events. input should be a search query.";
}
