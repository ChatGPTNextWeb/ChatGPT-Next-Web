import { OpenAIApi, Configuration, ConfigurationParameters } from "openai";
import { ChatRequest } from "./typing";

export async function POST(req: Request) {
  try {
    let apiKey = process.env.OPENAI_API_KEY;
    let apiBasePath = process.env.OPENAI_API_BASE_PATH;

    const userApiKey = req.headers.get("token");
    if (userApiKey) {
      apiKey = userApiKey;
    }
    let configuration: ConfigurationParameters = {
      apiKey,
    };
    if (apiBasePath) {
      configuration.basePath = apiBasePath.replace(/\/+$/, "");
    }

    const openai = new OpenAIApi(new Configuration(configuration));

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
