import { OpenAIApi, Configuration } from "openai";
import { apiKey } from "./config";

// set up openai api client
const config = new Configuration({
  apiKey,
});
const openai = new OpenAIApi(config);

export async function GET(req: Request) {
  try {
    const completion = await openai.createChatCompletion(
      {
        messages: [
          {
            role: "user",
            content: "hello",
          },
        ],
        model: "gpt-3.5-turbo",
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
