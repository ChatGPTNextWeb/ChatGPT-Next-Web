import { OpenAIApi, Configuration } from "openai";
import { ChatRequest } from "./typing";

export async function POST(req: Request) {
  try {
    let apiKey = process.env.OPENAI_API_KEY;

    const userApiKey = req.headers.get("token");
    if (userApiKey) {
      apiKey = userApiKey;
    }

    let basePath = undefined;
    if (process.env.OPENAI_API_BASE_PATH) {
      basePath = process.env.OPENAI_API_BASE_PATH.replace(/\/+$/, "");
    }  

    const openai = new OpenAIApi(
      new Configuration({
        apiKey,
      }),
      basePath
    );

    const requestBody = (await req.json()) as ChatRequest;
    const completion = await openai!.createChatCompletion({
      ...requestBody,
    });

    return new Response(JSON.stringify(completion.data));
  } catch (e) {
    console.error("[Chat] ", e);
    return new Response(JSON.stringify(e));
  }
}
