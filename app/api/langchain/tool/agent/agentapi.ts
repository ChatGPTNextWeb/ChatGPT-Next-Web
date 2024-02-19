import { NextRequest, NextResponse } from "next/server";
import { getServerSideConfig } from "@/app/config/server";

import { BaseCallbackHandler } from "@langchain/core/callbacks/base";

import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { AgentExecutor, AgentStep } from "langchain/agents";
import { ACCESS_CODE_PREFIX, ServiceProvider } from "@/app/constant";

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
import { ChatOpenAI } from "@langchain/openai";
import {
  BaseMessage,
  FunctionMessage,
  ToolMessage,
  SystemMessage,
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";

export interface RequestMessage {
  role: string;
  content: string;
}

export interface RequestBody {
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

  async getOpenAIApiKey(token: string) {
    const serverConfig = getServerSideConfig();
    const isApiKey = !token.startsWith(ACCESS_CODE_PREFIX);

    let apiKey = serverConfig.apiKey;
    if (isApiKey && token) {
      apiKey = token;
    }
    return apiKey;
  }

  async getOpenAIBaseUrl(reqBaseUrl: string | undefined) {
    const serverConfig = getServerSideConfig();
    let baseUrl = "https://api.openai.com/v1";
    if (serverConfig.baseUrl) baseUrl = serverConfig.baseUrl;
    if (reqBaseUrl?.startsWith("http://") || reqBaseUrl?.startsWith("https://"))
      baseUrl = reqBaseUrl;
    if (!baseUrl.endsWith("/v1"))
      baseUrl = baseUrl.endsWith("/") ? `${baseUrl}v1` : `${baseUrl}/v1`;
    console.log("[baseUrl]", baseUrl);
    return baseUrl;
  }

  async getApiHandler(
    req: NextRequest,
    reqBody: RequestBody,
    customTools: any[],
  ) {
    try {
      let useTools = reqBody.useTools ?? [];
      const serverConfig = getServerSideConfig();

      // const reqBody: RequestBody = await req.json();
      const isAzure = reqBody.isAzure || serverConfig.isAzure;
      const authHeaderName = isAzure ? "api-key" : "Authorization";
      const authToken = req.headers.get(authHeaderName) ?? "";
      const token = authToken.trim().replaceAll("Bearer ", "").trim();

      let apiKey = await this.getOpenAIApiKey(token);
      if (isAzure) apiKey = token;
      let baseUrl = "https://api.openai.com/v1";
      if (serverConfig.baseUrl) baseUrl = serverConfig.baseUrl;
      if (
        reqBody.baseUrl?.startsWith("http://") ||
        reqBody.baseUrl?.startsWith("https://")
      ) {
        baseUrl = reqBody.baseUrl;
      }
      if (!isAzure && !baseUrl.endsWith("/v1")) {
        baseUrl = baseUrl.endsWith("/") ? `${baseUrl}v1` : `${baseUrl}/v1`;
      }
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
      if (process.env.GOOGLE_CSE_ID && process.env.GOOGLE_API_KEY) {
        let googleCustomSearchTool = new langchainTools["GoogleCustomSearch"]();
        searchTool = new DynamicTool({
          name: "google_custom_search",
          description: googleCustomSearchTool.description,
          func: async (input: string) => googleCustomSearchTool.call(input),
        });
      }

      const tools = [];

      if (useTools.includes("web-search")) tools.push(searchTool);
      // console.log(customTools);

      customTools.forEach((customTool) => {
        if (customTool) {
          if (useTools.includes(customTool.name)) {
            tools.push(customTool);
          }
        }
      });

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

      let llm = new ChatOpenAI(
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

      if (reqBody.isAzure || serverConfig.isAzure) {
        llm = new ChatOpenAI({
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
      const memory = new BufferMemory({
        memoryKey: "history",
        inputKey: "question",
        outputKey: "answer",
        returnMessages: true,
        chatHistory: new ChatMessageHistory(pastMessages),
      });
      const MEMORY_KEY = "chat_history";
      const prompt = ChatPromptTemplate.fromMessages([
        new MessagesPlaceholder(MEMORY_KEY),
        ["user", "{input}"],
        new MessagesPlaceholder("agent_scratchpad"),
      ]);
      const modelWithTools = llm.bind({
        tools: tools.map(convertToOpenAITool),
      });
      const runnableAgent = RunnableSequence.from([
        {
          input: (i: { input: string; steps: ToolsAgentStep[] }) => {
            return i.input;
          },
          agent_scratchpad: (i: { input: string; steps: ToolsAgentStep[] }) => {
            return formatToOpenAIToolMessages(i.steps);
          },
          chat_history: async (i: {
            input: string;
            steps: ToolsAgentStep[];
          }) => {
            const { history } = await memory.loadMemoryVariables({});
            return history;
          },
        },
        prompt,
        modelWithTools,
        new OpenAIToolsAgentOutputParser(),
      ]).withConfig({ runName: "OpenAIToolsAgent" });

      const executor = AgentExecutor.fromAgentAndTools({
        agent: runnableAgent,
        tools,
      });

      executor
        .invoke(
          {
            input: reqBody.messages.slice(-1)[0].content,
            signal: this.controller.signal,
          },
          {
            callbacks: [handler],
          },
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
