import { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";

export class ArxivAPIWrapper extends StructuredTool {
  get lc_namespace() {
    return [...super.lc_namespace, "test"];
  }

  name = "arxiv";
  description = "Run Arxiv search and get the article information.";

  SORT_BY = {
    RELEVANCE: "relevance",
    LAST_UPDATED_DATE: "lastUpdatedDate",
    SUBMITTED_DATE: "submittedDate",
  };

  SORT_ORDER = {
    ASCENDING: "ascending",
    DESCENDING: "descending",
  };

  schema = z.object({
    searchQuery: z
      .string()
      .describe("same as the search_query parameter rules of the arxiv API."),
    sortBy: z
      .string()
      .describe('can be "relevance", "lastUpdatedDate", "submittedDate".'),
    sortOrder: z
      .string()
      .describe('can be either "ascending" or "descending".'),
    start: z
      .number()
      .default(0)
      .describe("the index of the first returned result."),
    maxResults: z
      .number()
      .default(10)
      .describe("the number of results returned by the query."),
  });

  async _call({
    searchQuery,
    sortBy,
    sortOrder,
    start,
    maxResults,
  }: z.infer<typeof this.schema>) {
    if (sortBy && !Object.values(this.SORT_BY).includes(sortBy)) {
      throw new Error(
        `unsupported sort by option. should be one of: ${Object.values(
          this.SORT_BY,
        ).join(" ")}`,
      );
    }
    if (sortOrder && !Object.values(this.SORT_ORDER).includes(sortOrder)) {
      throw new Error(
        `unsupported sort order option. should be one of: ${Object.values(
          this.SORT_ORDER,
        ).join(" ")}`,
      );
    }
    try {
      let url = `https://export.arxiv.org/api/query?search_query=${searchQuery}&start=${start}&max_results=${maxResults}${
        sortBy ? `&sortBy=${sortBy}` : ""
      }${sortOrder ? `&sortOrder=${sortOrder}` : ""}`;
      console.log("[arxiv]", url);
      const response = await fetch(url);
      const data = await response.text();
      console.log("[arxiv]", data);
      return data;
    } catch (e) {
      console.error("[arxiv]", e);
    }
    return "not found";
  }
}
