import { ModelProvider } from "../constant";
import { prettyObject } from "../utils/format";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  ValidationException,
} from "@aws-sdk/client-bedrock-runtime";
import { validateModelId } from "./bedrock/utils";
import {
  ConverseRequest,
  formatRequestBody,
  parseModelResponse,
} from "./bedrock/models";

interface ContentItem {
  type: string;
  text?: string;
  image_url?: {
    url: string;
  };
}

const ALLOWED_PATH = new Set(["invoke", "converse"]);

export async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  console.log("[Bedrock Route] params ", params);

  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }

  const subpath = params.path.join("/");

  if (!ALLOWED_PATH.has(subpath)) {
    console.log("[Bedrock Route] forbidden path ", subpath);
    return NextResponse.json(
      {
        error: true,
        msg: "you are not allowed to request " + subpath,
      },
      {
        status: 403,
      },
    );
  }

  const authResult = auth(req, ModelProvider.Bedrock);
  if (authResult.error) {
    return NextResponse.json(authResult, {
      status: 401,
    });
  }

  try {
    if (subpath === "converse") {
      const response = await handleConverseRequest(req);
      return response;
    } else {
      const response = await handleInvokeRequest(req);
      return response;
    }
  } catch (e) {
    console.error("[Bedrock] ", e);

    // Handle specific error cases
    if (e instanceof ValidationException) {
      return NextResponse.json(
        {
          error: true,
          message:
            "Model validation error. If using a Llama model, please provide a valid inference profile ARN.",
          details: e.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: true,
        message: e instanceof Error ? e.message : "Unknown error",
        details: prettyObject(e),
      },
      { status: 500 },
    );
  }
}

async function handleConverseRequest(req: NextRequest) {
  const controller = new AbortController();

  const region = req.headers.get("X-Region") || "us-east-1";
  const accessKeyId = req.headers.get("X-Access-Key") || "";
  const secretAccessKey = req.headers.get("X-Secret-Key") || "";
  const sessionToken = req.headers.get("X-Session-Token");

  if (!accessKeyId || !secretAccessKey) {
    return NextResponse.json(
      {
        error: true,
        message: "Missing AWS credentials",
      },
      {
        status: 401,
      },
    );
  }

  console.log("[Bedrock] Using region:", region);

  const client = new BedrockRuntimeClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
      sessionToken: sessionToken || undefined,
    },
  });

  const timeoutId = setTimeout(
    () => {
      controller.abort();
    },
    10 * 60 * 1000,
  );

  try {
    const body = (await req.json()) as ConverseRequest;
    const { modelId } = body;

    // Validate model ID
    const validationError = validateModelId(modelId);
    if (validationError) {
      throw new ValidationException({
        message: validationError,
        $metadata: {},
      });
    }

    console.log("[Bedrock] Invoking model:", modelId);
    console.log("[Bedrock] Messages:", body.messages);

    const requestBody = formatRequestBody(body);

    const jsonString = JSON.stringify(requestBody);
    const input = {
      modelId,
      contentType: "application/json",
      accept: "application/json",
      body: Uint8Array.from(Buffer.from(jsonString)),
    };

    console.log("[Bedrock] Request input:", {
      ...input,
      body: requestBody,
    });

    const command = new InvokeModelCommand(input);
    const response = await client.send(command);

    console.log("[Bedrock] Got response");

    // Parse and format the response based on model type
    const responseBody = new TextDecoder().decode(response.body);
    const formattedResponse = parseModelResponse(responseBody, modelId);

    return NextResponse.json(formattedResponse);
  } catch (e) {
    console.error("[Bedrock] Request error:", e);
    throw e; // Let the main error handler deal with it
  } finally {
    clearTimeout(timeoutId);
  }
}

async function handleInvokeRequest(req: NextRequest) {
  const controller = new AbortController();

  const region = req.headers.get("X-Region") || "us-east-1";
  const accessKeyId = req.headers.get("X-Access-Key") || "";
  const secretAccessKey = req.headers.get("X-Secret-Key") || "";
  const sessionToken = req.headers.get("X-Session-Token");

  if (!accessKeyId || !secretAccessKey) {
    return NextResponse.json(
      {
        error: true,
        message: "Missing AWS credentials",
      },
      {
        status: 401,
      },
    );
  }

  const client = new BedrockRuntimeClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
      sessionToken: sessionToken || undefined,
    },
  });

  const timeoutId = setTimeout(
    () => {
      controller.abort();
    },
    10 * 60 * 1000,
  );

  try {
    const body = await req.json();
    const { messages, model } = body;

    // Validate model ID
    const validationError = validateModelId(model);
    if (validationError) {
      throw new ValidationException({
        message: validationError,
        $metadata: {},
      });
    }

    console.log("[Bedrock] Invoking model:", model);
    console.log("[Bedrock] Messages:", messages);

    const requestBody = formatRequestBody({
      modelId: model,
      messages,
      inferenceConfig: {
        maxTokens: 2048,
        temperature: 0.7,
        topP: 0.9,
      },
    });

    const jsonString = JSON.stringify(requestBody);
    const input = {
      modelId: model,
      contentType: "application/json",
      accept: "application/json",
      body: Uint8Array.from(Buffer.from(jsonString)),
    };

    console.log("[Bedrock] Request input:", {
      ...input,
      body: requestBody,
    });

    const command = new InvokeModelCommand(input);
    const response = await client.send(command);

    console.log("[Bedrock] Got response");

    // Parse and format the response
    const responseBody = new TextDecoder().decode(response.body);
    const formattedResponse = parseModelResponse(responseBody, model);

    // Extract text content from the response
    let textContent = "";
    if (formattedResponse.content && Array.isArray(formattedResponse.content)) {
      textContent = formattedResponse.content
        .filter((item: ContentItem) => item.type === "text")
        .map((item: ContentItem) => item.text || "")
        .join("");
    } else if (typeof formattedResponse.content === "string") {
      textContent = formattedResponse.content;
    }

    // Return plain text response
    return new NextResponse(textContent, {
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (e) {
    console.error("[Bedrock] Request error:", e);
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
}
