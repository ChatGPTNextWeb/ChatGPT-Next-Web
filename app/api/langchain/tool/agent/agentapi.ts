import { NextRequest, NextResponse } from "next/server";
import { getServerSideConfig } from "@/app/config/server";

import { BaseCallbackHandler } from "@langchain/core/callbacks/base";

import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import {
  AgentExecutor,
  AgentStep,
  createToolCallingAgent,
  createReactAgent,
} from "langchain/agents";
import {
  ACCESS_CODE_PREFIX,
  ANTHROPIC_BASE_URL,
  OPENAI_BASE_URL,
  ServiceProvider,
} from "@/app/constant";

// import * as langchainTools from "langchain/tools";
import * as langchainTools from "@/app/api/langchain-tools/langchian-tool-index";
import { DuckDuckGo } from "@/app/api/langchain-tools/duckduckgo_search";
import {
  DynamicTool,
  Tool,
  StructuredToolInterface,
} from "@langchain/core/tools";
import { convertToOpenAITool } from "@langchain/core/utils/function_calling";
import { BaiduSearch } from "@/app/api/langchain-tools/baidu_search";
import { GoogleSearch } from "@/app/api/langchain-tools/google_search";
import { formatToOpenAIToolMessages } from "langchain/agents/format_scratchpad/openai_tools";
import {
  OpenAIToolsAgentOutputParser,
  type ToolsAgentStep,
} from "langchain/agents/openai/output_parser";
import { RunnableSequence } from "@langchain/core/runnables";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import {
  BaseMessage,
  FunctionMessage,
  ToolMessage,
  SystemMessage,
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";
import { MultimodalContent } from "@/app/client/api";
import { GoogleCustomSearch } from "@/app/api/langchain-tools/langchian-tool-index";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";

export interface RequestMessage {
  role: string;
  content: string | MultimodalContent[];
}

export interface RequestBody {
  chatSessionId: string;
  messages: RequestMessage[];
  isAzure: boolean;
  azureApiVersion?: string;
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
  provider: ServiceProvider;
}

export class ResponseBody {
  isSuccess: boolean = true;
  message!: string;
  isToolMessage: boolean = false;
  toolName?: string;
}

export interface ToolInput {
  input: string;
}

export class AgentApi {
  private encoder: TextEncoder;
  private transformStream: TransformStream;
  private writer: WritableStreamDefaultWriter<any>;
  private controller: AbortController;

  constructor(
    encoder: TextEncoder,
    transformStream: TransformStream,
    writer: WritableStreamDefaultWriter<any>,
    controller: AbortController,
  ) {
    this.encoder = encoder;
    this.transformStream = transformStream;
    this.writer = writer;
    this.controller = controller;
  }

  async getHandler(reqBody: any) {
    var writer = this.writer;
    var encoder = this.encoder;
    var controller = this.controller;
    return BaseCallbackHandler.fromMethods({
      async handleLLMNewToken(token: string) {
        if (token && !controller.signal.aborted) {
          var response = new ResponseBody();
          response.message = token;
          await writer.ready;
          await writer.write(
            encoder.encode(`data: ${JSON.stringify(response)}\n\n`),
          );
        }
      },
      async handleChainError(err, runId, parentRunId, tags) {
        if (controller.signal.aborted) {
          console.warn("[handleChainError]", "abort");
          await writer.close();
          return;
        }
        console.log("[handleChainError]", err, "writer error");
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
        // console.log("[handleChainEnd]");
        // await writer.ready;
        // await writer.close();
      },
      async handleLLMEnd() {
        // await writer.ready;
        // await writer.close();
      },
      async handleLLMError(e: Error) {
        if (controller.signal.aborted) {
          console.warn("[handleLLMError]", "abort");
          await writer.close();
          return;
        }
        console.log("[handleLLMError]", e, "writer error");
        var response = new ResponseBody();
        response.isSuccess = false;
        response.message = e.message;
        await writer.ready;
        await writer.write(
          encoder.encode(`data: ${JSON.stringify(response)}\n\n`),
        );
        await writer.close();
      },
      async handleLLMStart(llm, _prompts: string[]) {
        // console.log("handleLLMStart: I'm the second handler!!", { llm });
      },
      async handleChainStart(chain) {
        // console.log("handleChainStart: I'm the second handler!!", { chain });
      },
      async handleAgentAction(action) {
        try {
          // console.log("[handleAgentAction]", { action });
          if (!reqBody.returnIntermediateSteps) return;
          var response = new ResponseBody();
          response.isToolMessage = true;
          response.message = JSON.stringify(action.toolInput);
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
      async handleToolStart(tool, input) {
        // console.log("[handleToolStart]", { tool, input });
      },
      async handleToolEnd(output, runId, parentRunId, tags) {
        // console.log("[handleToolEnd]", { output, runId, parentRunId, tags });
      },
      async handleAgentEnd(action, runId, parentRunId, tags) {
        if (controller.signal.aborted) {
          return;
        }
        console.log("[handleAgentEnd]");
        await writer.ready;
        await writer.close();
      },
    });
  }

  getApiKey(token: string, provider: ServiceProvider) {
    const serverConfig = getServerSideConfig();
    const isApiKey = !token.startsWith(ACCESS_CODE_PREFIX);

    if (isApiKey && token) {
      return token;
    }
    if (provider === ServiceProvider.OpenAI) return serverConfig.apiKey;
    if (provider === ServiceProvider.Anthropic)
      return serverConfig.anthropicApiKey;
    throw new Error("Unsupported provider");
  }

  getBaseUrl(reqBaseUrl: string | undefined, provider: ServiceProvider) {
    const serverConfig = getServerSideConfig();
    let baseUrl = "";
    if (provider === ServiceProvider.OpenAI) {
      baseUrl = OPENAI_BASE_URL;
      if (serverConfig.baseUrl) baseUrl = serverConfig.baseUrl;
    }
    if (provider === ServiceProvider.Anthropic) {
      baseUrl = ANTHROPIC_BASE_URL;
      if (serverConfig.anthropicUrl) baseUrl = serverConfig.anthropicUrl;
    }
    if (reqBaseUrl?.startsWith("http://") || reqBaseUrl?.startsWith("https://"))
      baseUrl = reqBaseUrl;
    if (!baseUrl.endsWith("/v1") && provider === ServiceProvider.OpenAI)
      baseUrl = baseUrl.endsWith("/") ? `${baseUrl}v1` : `${baseUrl}/v1`;
    return baseUrl;
  }

  getToolBaseLanguageModel(
    reqBody: RequestBody,
    apiKey: string,
    baseUrl: string,
  ) {
    if (reqBody.provider === ServiceProvider.Anthropic) {
      return new ChatAnthropic({
        temperature: 0,
        modelName: reqBody.model,
        apiKey: apiKey,
        clientOptions: {
          baseURL: baseUrl,
        },
      });
    }
    return new ChatOpenAI(
      {
        temperature: 0,
        modelName: reqBody.model,
        openAIApiKey: apiKey,
      },
      { basePath: baseUrl },
    );
  }

  getToolEmbeddings(reqBody: RequestBody, apiKey: string, baseUrl: string) {
    if (reqBody.provider === ServiceProvider.Anthropic) {
      if (process.env.OLLAMA_BASE_URL) {
        return new OllamaEmbeddings({
          model: process.env.RAG_EMBEDDING_MODEL,
          baseUrl: process.env.OLLAMA_BASE_URL,
        });
      } else {
        return null;
      }
    }
    return new OpenAIEmbeddings(
      {
        openAIApiKey: apiKey,
      },
      { basePath: baseUrl },
    );
  }

  getLLM(reqBody: RequestBody, apiKey: string, baseUrl: string) {
    const serverConfig = getServerSideConfig();
    if (reqBody.isAzure || serverConfig.isAzure) {
      console.log("[use Azure ChatOpenAI]");
      return new ChatOpenAI({
        temperature: reqBody.temperature,
        streaming: reqBody.stream,
        topP: reqBody.top_p,
        presencePenalty: reqBody.presence_penalty,
        frequencyPenalty: reqBody.frequency_penalty,
        azureOpenAIApiKey: apiKey,
        azureOpenAIApiVersion: reqBody.isAzure
          ? reqBody.azureApiVersion
          : serverConfig.azureApiVersion,
        azureOpenAIApiDeploymentName: reqBody.model,
        azureOpenAIBasePath: baseUrl,
      });
    }
    if (reqBody.provider === ServiceProvider.OpenAI) {
      console.log("[use ChatOpenAI]");
      return new ChatOpenAI(
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
    }
    if (reqBody.provider === ServiceProvider.Anthropic) {
      console.log("[use ChatAnthropic]");
      return new ChatAnthropic({
        model: reqBody.model,
        apiKey: apiKey,
        temperature: reqBody.temperature,
        streaming: reqBody.stream,
        topP: reqBody.top_p,
        clientOptions: {
          baseURL: baseUrl,
        },
      });
    }
    throw new Error("Unsupported model providers");
  }

  getAuthHeader(reqBody: RequestBody): string {
    const serverConfig = getServerSideConfig();
    return reqBody.isAzure || serverConfig.isAzure
      ? "api-key"
      : reqBody.provider === ServiceProvider.Anthropic
        ? "x-api-key"
        : "Authorization";
  }

  async getApiHandler(
    req: NextRequest,
    reqBody: RequestBody,
    customTools: any[],
  ) {
    try {
      process.env.LANGCHAIN_CALLBACKS_BACKGROUND = "true";
      let useTools = reqBody.useTools ?? [];
      const serverConfig = getServerSideConfig();

      // const reqBody: RequestBody = await req.json();
      // ui set azure model provider
      const isAzure = reqBody.isAzure;
      const authHeaderName = this.getAuthHeader(reqBody);
      const authToken = req.headers.get(authHeaderName) ?? "";
      const token = authToken.trim().replaceAll("Bearer ", "").trim();

      let apiKey = this.getApiKey(token, reqBody.provider);
      if (isAzure) apiKey = token;
      let baseUrl = this.getBaseUrl(reqBody.baseUrl, reqBody.provider);
      if (!reqBody.isAzure && serverConfig.isAzure) {
        baseUrl = serverConfig.azureUrl || baseUrl;
      }
      console.log("[baseUrl]", baseUrl);

      var handler = await this.getHandler(reqBody);

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
      if (process.env.GOOGLE_CSE_ID && process.env.GOOGLE_SEARCH_API_KEY) {
        let googleCustomSearchTool = new GoogleCustomSearch({
          apiKey: process.env.GOOGLE_SEARCH_API_KEY,
          googleCSEId: process.env.GOOGLE_CSE_ID,
        });
        searchTool = new DynamicTool({
          name: "google_custom_search",
          description: googleCustomSearchTool.description,
          func: async (input: string) => googleCustomSearchTool.call(input),
        });
      }

      const tools = [];

      // configure the right tool for web searching
      if (useTools.includes("web-search")) tools.push(searchTool);
      // console.log(customTools);

      // include tools included in this project
      customTools.forEach((customTool) => {
        if (customTool) {
          if (useTools.includes(customTool.name)) {
            tools.push(customTool);
          }
        }
      });

      // include tools from Langchain community
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
          if (message.role === "system" && typeof message.content === "string")
            pastMessages.push(new SystemMessage(message.content));
          if (message.role === "user")
            typeof message.content === "string"
              ? pastMessages.push(new HumanMessage(message.content))
              : pastMessages.push(
                  new HumanMessage({ content: message.content }),
                );
          if (
            message.role === "assistant" &&
            typeof message.content === "string"
          )
            pastMessages.push(new AIMessage(message.content));
        });

      let llm = this.getLLM(reqBody, apiKey, baseUrl);

      const MEMORY_KEY = "chat_history";
      const prompt = ChatPromptTemplate.fromMessages([
        new MessagesPlaceholder(MEMORY_KEY),
        new MessagesPlaceholder("input"),
        new MessagesPlaceholder("agent_scratchpad"),
      ]);

      const lastMessageContent = reqBody.messages.slice(-1)[0].content;
      const lastHumanMessage =
        typeof lastMessageContent === "string"
          ? new HumanMessage(lastMessageContent)
          : new HumanMessage({ content: lastMessageContent });
      const agent = createToolCallingAgent({
        llm,
        tools,
        prompt,
      });
      const agentExecutor = new AgentExecutor({
        agent,
        tools,
        maxIterations: reqBody.maxIterations,
      });
      agentExecutor
        .invoke(
          {
            input: lastHumanMessage,
            chat_history: pastMessages,
            signal: this.controller.signal,
          },
          { callbacks: [handler] },
        )
        .catch((error) => {
          if (this.controller.signal.aborted) {
            console.warn("[AgentCall]", "abort");
          } else {
            console.error("[AgentCall]", error);
          }
        });

      return new Response(this.transformStream.readable, {
        headers: { "Content-Type": "text/event-stream" },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: (e as any).message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
}
