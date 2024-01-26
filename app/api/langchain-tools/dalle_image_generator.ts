import { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import S3FileStorage from "../../utils/s3_file_storage";

export class DallEAPIWrapper extends StructuredTool {
  name = "dalle_image_generator";
  n = 1;
  apiKey: string;
  baseURL?: string;
  model: string;

  noStorage: boolean;

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

    this.noStorage = !!process.env.DALLE_NO_IMAGE_STORAGE;
    this.model = process.env.DALLE_MODEL ?? "dall-e-3";
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
        "A text description of the desired image(s). input must be a english prompt.",
      ),
    size: z
      .enum(["1024x1024", "1024x1792", "1792x1024"])
      .default("1024x1024")
      .describe("images size"),
    quality: z
      .enum(["standard", "hd"])
      .default("standard")
      .describe(
        "hd increases image detail and clarity at the cost of doubled consumption, and should not be used unless specified by the user.",
      ),
    style: z
      .enum(["vivid", "natural"])
      .default("vivid")
      .describe(
        "vivid leads to the creation of more intense and dramatic images, while Natural results in images that look more realistic and less exaggerated.",
      ),
  });

  /** @ignore */
  async _call({ prompt, size, quality, style }: z.infer<typeof this.schema>) {
    let imageUrl;
    const apiUrl = `${this.baseURL}/images/generations`;
    try {
      let requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          n: this.n,
          size: size,
          quality: quality,
          style: style,
        }),
      };
      if (this.model != "dall-e-3") {
        requestOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: this.model,
            prompt: prompt,
            n: this.n,
            size: size,
          }),
        };
      }
      console.log(requestOptions);
      const response = await fetch(apiUrl, requestOptions);
      const json = await response.json();
      try {
        console.log("[DALL-E]", json);
        imageUrl = json.data[0].url;
      } catch (e) {
        if (this.callback != null) await this.callback(JSON.stringify(json));
        throw e;
      }
    } catch (e) {
      console.error("[DALL-E]", e);
      return (e as Error).message;
    }
    if (!imageUrl) return "No image was generated";
    try {
      let filePath = imageUrl;
      if (!this.noStorage) {
        filePath = await this.saveImageFromUrl(imageUrl);
      }
      console.log("[DALL-E]", filePath);
      var imageMarkdown = `![img](${filePath})`;
      if (this.callback != null) await this.callback(imageMarkdown);
      return "Generated success";
    } catch (e) {
      if (this.callback != null)
        await this.callback("Image upload to OSS failed");
      return "Image upload to OSS failed";
    }
  }

  description = `openai's dall-e image generator.`;
}
