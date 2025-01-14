import { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { XMLParser } from "fast-xml-parser";

// Credit: ArxivRetriever from Langchain.js
interface ArxivEntry {
  id: string;
  title: string;
  summary: string;
  published: string;
  authors: string[];
  pdfUrl: string;
  links: any[];
}
function parseArxivEntry(entry: any): ArxivEntry {
  const title = entry.title.replace(/\s+/g, " ").trim();
  const summary = entry.summary.replace(/\s+/g, " ").trim();
  const published = entry.published;

  // Extract authors
  let authors: string[] = [];
  if (Array.isArray(entry.author)) {
    authors = entry.author.map((author: any) => author.name);
  } else if (entry.author) {
    authors = [entry.author.name];
  }
  // Extract links
  let links: any[] = [];
  if (Array.isArray(entry.link)) {
    links = entry.link;
  } else if (entry.link) {
    links = [entry.link];
  }
  // Extract PDF link
  let pdfUrl = entry.id.replace("/abs/", "/pdf/") + ".pdf";
  const pdfLinkObj = links.find((link: any) => link["@_title"] === "pdf");
  if (pdfLinkObj && pdfLinkObj["@_href"]) {
    pdfUrl = pdfLinkObj["@_href"];
  }
  return {
    id: entry.id,
    title: title,
    summary: summary,
    published: published,
    authors,
    pdfUrl,
    links: entry.links,
  };
}

function parseArxivResponse(response: string): ArxivEntry[] {
  const options = {
    attributeNamePrefix: "@_",
    ignoreAttributes: false,
    parseNodeValue: true,
    parseAttributeValue: true,
    trimValues: true,
    ignoreNameSpace: true,
  };
  const parser = new XMLParser(options);
  const results = parser.parse(response);
  const entries = results.feed.entry;
  if (!entries) {
    return [];
  }
  return entries.map(parseArxivEntry);
}
async function buildArxivResponse(query: string): Promise<string> {
  const article_list = await parseArxivResponse(query);
  if (article_list.length === 0) {
    return `Found no article in arxiv database`;
  } else {
    let response = `Found these articles in arxiv database \n\n`;
    const articles_str = article_list.map((article) => {
      return `Title: ${article.title}\nAuthors: ${article.authors.join(", ")}\n
            Summary: ${article.summary}\nPublished: ${article.published}\n
            PDF: ${article.pdfUrl}`;
    });
    return `${response} \n \n ${articles_str.join("\n\n")}`;
  }
}

export class ArxivAPIWrapper extends StructuredTool {
  get lc_namespace() {
    return [...super.lc_namespace, "test"];
  }

  name = "arxiv";
  description =
    "Useful if you need to look for academical papers on arxiv. You can search by title, author, abstract, etc.";

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
    searchQuery: z.string().describe("topic of your query"),
    sortBy: z
      .string()
      .optional()
      .default(this.SORT_BY.RELEVANCE)
      .describe(
        'sort rules, can be "relevance", "lastUpdatedDate", "submittedDate". Default by relevance if no' +
          "additional request is made.",
      ),
    sortOrder: z
      .string()
      .optional()
      .default(this.SORT_ORDER.DESCENDING)
      .describe(
        'order of sort, can be either "ascending" or "descending". Default by descending.',
      ),
    start: z
      .number()
      .optional()
      .default(0)
      .describe("the index of the first returned result. Default 0."),
    maxResults: z
      .number()
      .optional()
      .default(20)
      .describe("the number of returned items. Default 20."),
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
      let url = `https://export.arxiv.org/api/query?search_query=all:${searchQuery}&start=${start}&max_results=${maxResults}${
        sortBy ? `&sortBy=${sortBy}` : ""
      }${sortOrder ? `&sortOrder=${sortOrder}` : ""}`;
      console.log("[arxiv]", url);
      const api_response = await fetch(url);
      const response_text = await api_response.text();
      const arxiv_data = await buildArxivResponse(response_text);
      console.log("[arxiv]", arxiv_data);
      return arxiv_data;
    } catch (e) {
      console.error("[arxiv]", e);
    }
    return `Invalid request ${searchQuery}`;
  }
}
