import { getEnvironmentVariable } from "@langchain/core/utils/env";
import { Tool } from "@langchain/core/tools";

const API_PROXY_PREFIX = process.env.GOOGLE_PLUGIN_API_PROXY_PREFIX ?? "";

/**
 * Interface for parameters required by GoogleCustomSearch class.
 */
export interface GoogleCustomSearchParams {
  apiKey?: string;
  googleCSEId?: string;
}

/**
 * Class that uses the Google Search API to perform custom searches.
 * Requires environment variables `GOOGLE_API_KEY` and `GOOGLE_CSE_ID` to
 * be set.
 */
export class GoogleCustomSearch extends Tool {
  static lc_name() {
    return "GoogleCustomSearch";
  }

  get lc_secrets(): { [key: string]: string } | undefined {
    return {
      apiKey: "GOOGLE_API_KEY",
    };
  }

  name = "google-custom-search";

  protected apiKey: string;

  protected googleCSEId: string;

  description =
    "a custom search engine. useful for when you need to answer questions about current events. input should be a search query. outputs a JSON array of results.";

  constructor(
    fields: GoogleCustomSearchParams = {
      apiKey: getEnvironmentVariable("GOOGLE_API_KEY"),
      googleCSEId: getEnvironmentVariable("GOOGLE_CSE_ID"),
    },
  ) {
    super(...arguments);
    if (!fields.apiKey) {
      throw new Error(
        `Google API key not set. You can set it as "GOOGLE_API_KEY" in your environment variables.`,
      );
    }
    if (!fields.googleCSEId) {
      throw new Error(
        `Google custom search engine id not set. You can set it as "GOOGLE_CSE_ID" in your environment variables.`,
      );
    }
    this.apiKey = fields.apiKey;
    this.googleCSEId = fields.googleCSEId;
  }

  async _call(input: string) {
    const res = await fetch(
      `${API_PROXY_PREFIX}https://www.googleapis.com/customsearch/v1?key=${this.apiKey}&cx=${
        this.googleCSEId
      }&q=${encodeURIComponent(input)}`,
    );

    if (!res.ok) {
      throw new Error(
        `Got ${res.status} error from Google custom search: ${res.statusText}`,
      );
    }

    const json = await res.json();

    const results =
      json?.items?.map(
        (item: { title?: string; link?: string; snippet?: string }) => ({
          title: item.title,
          link: item.link,
          snippet: item.snippet,
        }),
      ) ?? [];
    return JSON.stringify(results);
  }
}
