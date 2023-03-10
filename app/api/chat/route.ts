import { OpenAIApi, Configuration } from "openai";
import { apiKey } from "./config";
import { ChatRequest } from "./typing";

// set up openai api client
const config = new Configuration({
  apiKey,
});
const openai = new OpenAIApi(config);

export async function POST(req: Request) {
  try {
    const requestBody = (await req.json()) as ChatRequest;
    const completion = await openai.createChatCompletion(
      {
        ...requestBody,
      },
      {
        proxy: {
          protocol: "socks",
          host: "127.0.0.1",
          port: 7890,
        },
      }
    );

    return new Response(JSON.stringify(completion.data));
  } catch (e) {
    return new Response(JSON.stringify(e));
  }
}
