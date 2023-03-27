import { OpenAIApi, Configuration } from "openai";
import { ChatRequest } from "./typing";

export async function POST(req: Request) {
  try {
    let apiKey = process.env.OPENAI_API_KEY;

    const userApiKey = req.headers.get("token");
    if (userApiKey) {
      apiKey = userApiKey;
    }

    const openai = new OpenAIApi(
      new Configuration({
        apiKey,
      })
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
