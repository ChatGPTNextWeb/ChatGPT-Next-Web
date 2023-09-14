import * as fs from "fs";
import * as path from "path";
import axios from "axios";

import { Tool } from "langchain/tools";
import OpenAI from "openai";

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
    const response = await axios.get(url, { responseType: "arraybuffer" });

    const uploadsDir = "public/uploads";
    console.log("[fileUpload]", { uploadsDir });
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `${Date.now()}.png`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, Buffer.from(response.data, "binary"));

    return `uploads/${filename}`;
  }

  /** @ignore */
  async _call(prompt: string) {
    const openai = new OpenAI({
      apiKey: this.apiKey,
      baseURL: this.baseURL,
    });
    const response = await openai.images.generate({
      prompt: prompt,
      n: this.n,
      size: this.size,
    });

    let image_url = response.data[0].url;
    console.log(image_url);
    if (!image_url) return "No image was generated";
    let filePath = await this.saveImageFromUrl(image_url);
    console.log(filePath);
    return filePath;
  }

  description = `openai's dall-e image generator.
    input must be a english prompt.
    output will be the image link url.
    use markdown to display images.`;
}
