import { htmlToText } from "html-to-text";
import { Tool } from "@langchain/core/tools";

export interface Headers {
  [key: string]: string;
}

export interface RequestTool {
  headers: Headers;
  maxOutputLength?: number;
  timeout: number;
}

export class HttpGetTool extends Tool implements RequestTool {
  name = "http_get";

  maxOutputLength = Infinity;

  timeout = 10000;

  constructor(
    public headers: Headers = {},
    { maxOutputLength }: { maxOutputLength?: number } = {},
    { timeout }: { timeout?: number } = {},
  ) {
    super(...arguments);

    this.maxOutputLength = maxOutputLength ?? this.maxOutputLength;
    this.timeout = timeout ?? this.timeout;
  }

  /** @ignore */
  async _call(input: string) {
    try {
      const res = await this.fetchWithTimeout(
        input,
        {
          headers: this.headers,
        },
        this.timeout,
      );
      let text = await res.text();
      text = htmlToText(text);
      text = text.slice(0, this.maxOutputLength);
      console.log(text);
      return text;
    } catch (error) {
      console.error(error);
      return (error as Error).toString();
    }
  }

  async fetchWithTimeout(
    resource: RequestInfo | URL,
    options = {},
    timeout: number = 30000,
  ) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  }

  description = `A portal to the internet. Use this when you need to get specific content from a website.
  Input should be a url string (i.e. "https://www.google.com"). The output will be the text response of the GET request.`;
}
