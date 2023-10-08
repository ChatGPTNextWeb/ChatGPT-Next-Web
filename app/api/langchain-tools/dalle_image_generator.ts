import { Tool } from "langchain/tools";
import S3FileStorage from "../../utils/r2_file_storage";

export class DallEAPIWrapper extends Tool {
  name = "dalle_image_generator";
  n = 1;
  size: "256x256" | "512x512" | "1024x1024" | null = "1024x1024";
  apiKey: string;
  baseURL?: string;

  constructor(apiKey?: string | undefined, baseURL?: string | undefined) {
    super();
    if (!apiKey) {
      throw new Error("OpenAI API key not set.");
    }
    this.apiKey = apiKey;
    this.baseURL = baseURL;
  }

  async saveImageFromUrl(url: string) {
    const response = await fetch(url);
    const content = await response.arrayBuffer();
    const buffer = Buffer.from(content);
    return await S3FileStorage.put(`${Date.now()}.png`, buffer);
  }

  /** @ignore */
  async _call(prompt: string) {
    let image_url;
    const apiUrl = `${this.baseURL}/images/generations`;

    try {
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          prompt: prompt,
          n: this.n,
          size: this.size
        })
      };
      const response = await fetch(apiUrl, requestOptions);
      const json = await response.json();
      console.log("[DALL-E]", json);
      image_url = json.data[0].url;
    } catch (e) {
      console.error("[DALL-E]", e);
    }
    if (!image_url) return "No image was generated";
    let filePath = await this.saveImageFromUrl(image_url);
    console.log(filePath);
    return filePath;
  }

  description = `openai's dall-e image generator.
    input must be a english prompt.
    output will be the image link url.
    use markdown to display images. like: ![img](/api/file/xxx.png)`;
}
