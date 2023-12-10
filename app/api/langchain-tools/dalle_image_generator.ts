import { StructuredTool } from "langchain/tools";
import { z } from "zod";
import S3FileStorage from "../../utils/s3_file_storage";

export class DallEAPIWrapper extends StructuredTool {
  name = "dalle_image_generator";
  n = 1;
  apiKey: string;
  baseURL?: string;

  callback?: (data: string) => Promise<void>;

  constructor(
    apiKey?: string | undefined,
    baseURL?: string | undefined,
    callback?: (data: string) => Promise<void>,
  ) {
    super();
    if (!apiKey) {
      throw new Error("OpenAI API key not set.");
    }
    this.apiKey = apiKey;
    this.baseURL = baseURL;
    this.callback = callback;
  }

  async saveImageFromUrl(url: string) {
    const response = await fetch(url);
    const content = await response.arrayBuffer();
    const buffer = Buffer.from(content);
    return await S3FileStorage.put(`${Date.now()}.png`, buffer);
  }

  schema = z.object({
    prompt: z
      .string()
      .describe(
        'input must be a english prompt. you can set `quality: "hd"` for enhanced detail.',
      ),
    size: z
      .enum(["1024x1024", "1024x1792", "1792x1024"])
      .default("1024x1024")
      .describe("images size"),
  });

  /** @ignore */
  async _call({ prompt, size }: z.infer<typeof this.schema>) {
    let image_url;
    const apiUrl = `${this.baseURL}/images/generations`;
    try {
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: prompt,
          n: this.n,
          size: size,
        }),
      };
      const response = await fetch(apiUrl, requestOptions);
      const json = await response.json();
      console.log("[DALL-E]", json);
      image_url = json.data[0].url;
    } catch (e) {
      console.error("[DALL-E]", e);
    }
    if (!image_url) return "No image was generated";
    try {
      let filePath = await this.saveImageFromUrl(image_url);
      console.log("[DALL-E]", filePath);
      var imageMarkdown = `![img](${filePath})`;
      if (this.callback != null) await this.callback(imageMarkdown);
      return imageMarkdown;
    } catch (e) {
      if (this.callback != null)
        await this.callback("Image upload to R2 storage failed");
      return "Image upload to R2 storage failed";
    }
  }

  description = `openai's dall-e 3 image generator.`;
}
