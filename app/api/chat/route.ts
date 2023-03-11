import { OpenAIApi, Configuration } from "openai";
import { ChatRequest } from "./typing";

const isProd = process.env.NODE_ENV === "production";
const apiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAIApi(
  new Configuration({
    apiKey,
  })
);

export async function POST(req: Request) {
  try {
    const requestBody = (await req.json()) as ChatRequest;
    const completion = await openai!.createChatCompletion(
      {
        ...requestBody,
      },
      isProd
        ? {}
        : {
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
