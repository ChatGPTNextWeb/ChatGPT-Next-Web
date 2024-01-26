import { decode } from "html-entities";
import { convert as htmlToText } from "html-to-text";
import { Tool } from "@langchain/core/tools";
import * as cheerio from "cheerio";
import { getRandomUserAgent } from "./ua_tools";

interface SearchResults {
  /** The web results of the search. */
  results: SearchResult[];
}

interface SearchResult {
  /** The URL of the result. */
  url: string;
  /** The title of the result. */
  title: string;
  /**
   * The sanitized description of the result.
   * Bold tags will still be present in this string.
   */
  description: string;
}

async function search(
  input: string,
  maxResults: number,
): Promise<SearchResults> {
  const results: SearchResults = {
    results: [],
  };
  const headers = new Headers();
  headers.append("User-Agent", getRandomUserAgent());
  const resp = await fetch(
    `https://www.baidu.com/s?f=8&ie=utf-8&rn=${maxResults}&wd=${encodeURIComponent(
      input,
    )}`,
    {
      headers: headers,
    },
  );
  const respCheerio = cheerio.load(await resp.text());
  respCheerio("div.c-container.new-pmd").each((i, elem) => {
    const item = cheerio.load(elem);
    const linkElement = item("a");
    const url = (linkElement.attr("href") ?? "").trim();
    if (url !== "" && url !== "#") {
      const title = decode(linkElement.text());
      const description = item.text().replace(title, "").trim();
      results.results.push({
        url,
        title,
        description,
      });
    }
  });
  return results;
}

export class BaiduSearch extends Tool {
  name = "baidu_search";
  maxResults = 6;

  /** @ignore */
  async _call(input: string) {
    const searchResults = await search(input, this.maxResults);

    console.log(searchResults);

    if (searchResults.results.length === 0) {
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
