import { NextRequest, NextResponse } from "next/server";
import { getServerSideConfig } from "@/app/config/server";
import { auth } from "../../../auth";

import { ChatOpenAI } from "langchain/chat_models/openai";
import { BaseCallbackHandler } from "langchain/callbacks";

import { AIMessage, HumanMessage, SystemMessage } from "langchain/schema";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { ACCESS_CODE_PREFIX } from "@/app/constant";
import { OpenAI } from "langchain/llms/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

import * as langchainTools from "langchain/tools";
import { HttpGetTool } from "@/app/api/langchain-tools/http_get";
import { DuckDuckGo } from "@/app/api/langchain-tools/duckduckgo_search";
import { WebBrowser } from "langchain/tools/webbrowser";
import { Calculator } from "langchain/tools/calculator";
import { DynamicTool, Tool } from "langchain/tools";
import { DallEAPIWrapper } from "@/app/api/langchain-tools/dalle_image_generator";
import { BaiduSearch } from "@/app/api/langchain-tools/baidu_search";
import { GoogleSearch } from "@/app/api/langchain-tools/google_search";
import { StableDiffusionWrapper } from "@/app/api/langchain-tools/stable_diffusion_image_generator";

const serverConfig = getServerSideConfig();

interface RequestMessage {
  role: string;
  content: string;
}

interface RequestBody {
  messages: RequestMessage[];
  model: string;
  stream?: boolean;
  temperature: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  top_p?: number;
  baseUrl?: string;
  apiKey?: string;
  maxIterations: number;
  returnIntermediateSteps: boolean;
  useTools: (undefined | string)[];
}

class ResponseBody {
  isSuccess: boolean = true;
  message!: string;
  isToolMessage: boolean = false;
  toolName?: string;
}

interface ToolInput {
  input: string;
}

async function handle(req: NextRequest) {
  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }
  try {
    const authResult = auth(req);
    if (authResult.error) {
      return NextResponse.json(authResult, {
        status: 401,
      });
    }

    const encoder = new TextEncoder();
    const transformStream = new TransformStream();
    const writer = transformStream.writable.getWriter();
    const reqBody: RequestBody = await req.json();
    const authToken = req.headers.get("Authorization") ?? "";
    const token = authToken.trim().replaceAll("Bearer ", "").trim();
    const isOpenAiKey = !token.startsWith(ACCESS_CODE_PREFIX);
    let useTools = reqBody.useTools ?? [];
    let apiKey = serverConfig.apiKey;
    if (isOpenAiKey && token) {
      apiKey = token;
    }

    // support base url
    let baseUrl = "https://api.openai.com/v1";
    if (serverConfig.baseUrl) baseUrl = serverConfig.baseUrl;
    if (
      reqBody.baseUrl?.startsWith("http://") ||
      reqBody.baseUrl?.startsWith("https://")
    )
      baseUrl = reqBody.baseUrl;
    if (!baseUrl.endsWith("/v1"))
      baseUrl = baseUrl.endsWith("/") ? `${baseUrl}v1` : `${baseUrl}/v1`;
    console.log("[baseUrl]", baseUrl);

    const handler = BaseCallbackHandler.fromMethods({
      async handleLLMNewToken(token: string) {
        if (token) {
          console.log("[Token]", token);
          var response = new ResponseBody();
          response.message = token;
          await writer.ready;
          await writer.write(
            encoder.encode(`data: ${JSON.stringify(response)}\n\n`),
          );
        }
      },
      async handleChainError(err, runId, parentRunId, tags) {
        console.log(err, "writer error");
        var response = new ResponseBody();
        response.isSuccess = false;
        response.message = err;
        await writer.ready;
        await writer.write(
          encoder.encode(`data: ${JSON.stringify(response)}\n\n`),
        );
        await writer.close();
      },
      async handleChainEnd(outputs, runId, parentRunId, tags) {
        await writer.ready;
        await writer.close();
      },
      async handleLLMEnd() {
        // await writer.ready;
        // await writer.close();
      },
      async handleLLMError(e: Error) {
        console.log(e, "writer error");
        var response = new ResponseBody();
        response.isSuccess = false;
        response.message = e.message;
        await writer.ready;
        await writer.write(
          encoder.encode(`data: ${JSON.stringify(response)}\n\n`),
        );
        await writer.close();
      },
      handleLLMStart(llm, _prompts: string[]) {
        // console.log("handleLLMStart: I'm the second handler!!", { llm });
      },
      handleChainStart(chain) {
        // console.log("handleChainStart: I'm the second handler!!", { chain });
      },
      async handleAgentAction(action) {
        try {
          console.log(
            "agent (llm)",
            `tool: ${action.tool} toolInput: ${action.toolInput}`,
            { action },
          );
          if (!reqBody.returnIntermediateSteps) return;
          var response = new ResponseBody();
          response.isToolMessage = true;
          let toolInput = <ToolInput>(<unknown>action.toolInput);
          response.message = toolInput.input;
          response.toolName = action.tool;
          await writer.ready;
          await writer.write(
            encoder.encode(`data: ${JSON.stringify(response)}\n\n`),
          );
        } catch (ex) {
          console.error("[handleAgentAction]", ex);
          var response = new ResponseBody();
          response.isSuccess = false;
          response.message = (ex as Error).message;
          await writer.ready;
          await writer.write(
            encoder.encode(`data: ${JSON.stringify(response)}\n\n`),
          );
          await writer.close();
        }
      },
      handleToolStart(tool, input) {
        console.log("handleToolStart", { tool, input });
      },
    });

    let searchTool: Tool = new DuckDuckGo();
    if (process.env.CHOOSE_SEARCH_ENGINE) {
      switch (process.env.CHOOSE_SEARCH_ENGINE) {
        case "google":
          searchTool = new GoogleSearch();
          break;
        case "baidu":
          searchTool = new BaiduSearch();
          break;
      }
    }
    if (process.env.BING_SEARCH_API_KEY) {
      let bingSearchTool = new langchainTools["BingSerpAPI"](
        process.env.BING_SEARCH_API_KEY,
      );
      searchTool = new DynamicTool({
        name: "bing_search",
        description: bingSearchTool.description,
        func: async (input: string) => bingSearchTool.call(input),
      });
    }
    if (process.env.SERPAPI_API_KEY) {
      let serpAPITool = new langchainTools["SerpAPI"](
        process.env.SERPAPI_API_KEY,
      );
      searchTool = new DynamicTool({
        name: "google_search",
        description: serpAPITool.description,
        func: async (input: string) => serpAPITool.call(input),
      });
    }

    const model = new OpenAI(
      {
        temperature: 0,
        modelName: reqBody.model,
        openAIApiKey: apiKey,
      },
      { basePath: baseUrl },
    );
    const embeddings = new OpenAIEmbeddings(
      {
        openAIApiKey: apiKey,
      },
      { basePath: baseUrl },
    );

    const tools = [
      // new RequestsGetTool(),
      // new RequestsPostTool(),
    ];
    const webBrowserTool = new WebBrowser({ model, embeddings });
    const calculatorTool = new Calculator();
    const dallEAPITool = new DallEAPIWrapper(apiKey, baseUrl);
    const stableDiffusionTool = new StableDiffusionWrapper();
    if (useTools.includes("web-search")) tools.push(searchTool);
    if (useTools.includes(webBrowserTool.name)) tools.push(webBrowserTool);
    if (useTools.includes(calculatorTool.name)) tools.push(calculatorTool);
    if (useTools.includes(dallEAPITool.name)) tools.push(dallEAPITool);
    if (useTools.includes(stableDiffusionTool.name))
      tools.push(stableDiffusionTool);

    useTools.forEach((toolName) => {
      if (toolName) {
        var tool = langchainTools[
          toolName as keyof typeof langchainTools
        ] as any;
        if (tool) {
          tools.push(new tool());
        }
      }
    });

    const pastMessages = new Array();

    reqBody.messages
      .slice(0, reqBody.messages.length - 1)
      .forEach((message) => {
        if (message.role === "system")
          pastMessages.push(new SystemMessage(message.content));
        if (message.role === "user")
          pastMessages.push(new HumanMessage(message.content));
        if (message.role === "assistant")
          pastMessages.push(new AIMessage(message.content));
      });

    const memory = new BufferMemory({
      memoryKey: "chat_history",
      returnMessages: true,
      inputKey: "input",
      outputKey: "output",
      chatHistory: new ChatMessageHistory(pastMessages),
    });

    const llm = new ChatOpenAI(
      {
        modelName: reqBody.model,
        openAIApiKey: apiKey,
        temperature: reqBody.temperature,
        streaming: reqBody.stream,
        topP: reqBody.top_p,
        presencePenalty: reqBody.presence_penalty,
        frequencyPenalty: reqBody.frequency_penalty,
      },
      { basePath: baseUrl },
    );
    const executor = await initializeAgentExecutorWithOptions(tools, llm, {
      agentType: "openai-functions",
      returnIntermediateSteps: reqBody.returnIntermediateSteps,
      maxIterations: reqBody.maxIterations,
      memory: memory,
    });

    executor.call(
      {
        input: reqBody.messages.slice(-1)[0].content,
      },
      [handler],
    );

    console.log("returning response");
    return new Response(transformStream.readable, {
      headers: { "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as any).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const GET = handle;
export const POST = handle;

export const runtime = "edge";
