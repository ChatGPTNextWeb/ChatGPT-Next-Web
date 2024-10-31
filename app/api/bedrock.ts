import { ModelProvider } from "../constant";
import { prettyObject } from "../utils/format";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
import {
  BedrockRuntimeClient,
  ConverseStreamOutput,
  ValidationException,
  ModelStreamErrorException,
  ThrottlingException,
  ServiceUnavailableException,
  InternalServerException,
} from "@aws-sdk/client-bedrock-runtime";
import { validateModelId } from "./bedrock/utils";
import { ConverseRequest, createConverseStreamCommand } from "./bedrock/models";

const ALLOWED_PATH = new Set(["converse"]);

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
    const response = await handleConverseRequest(req);
    return response;
  } catch (e) {
    console.error("[Bedrock] ", e);
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
  const region = req.headers.get("X-Region") || "us-west-2";
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

  try {
    const body = (await req.json()) as ConverseRequest;
    const { modelId } = body;

    const validationError = validateModelId(modelId);
    if (validationError) {
      throw new Error(validationError);
    }

    console.log("[Bedrock] Invoking model:", modelId);

    const command = createConverseStreamCommand(body);
    const response = await client.send(command);

    if (!response.stream) {
      throw new Error("No stream in response");
    }

    // Create a ReadableStream for the response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const responseStream = response.stream;
          if (!responseStream) {
            throw new Error("No stream in response");
          }

          for await (const event of responseStream) {
            const output = event as ConverseStreamOutput;

            if ("messageStart" in output && output.messageStart?.role) {
              controller.enqueue(
                `data: ${JSON.stringify({
                  type: "messageStart",
                  role: output.messageStart.role,
                })}\n\n`,
              );
            } else if (
              "contentBlockStart" in output &&
              output.contentBlockStart
            ) {
              controller.enqueue(
                `data: ${JSON.stringify({
                  type: "contentBlockStart",
                  index: output.contentBlockStart.contentBlockIndex,
                  start: output.contentBlockStart.start,
                })}\n\n`,
              );
            } else if (
              "contentBlockDelta" in output &&
              output.contentBlockDelta?.delta
            ) {
              if ("text" in output.contentBlockDelta.delta) {
                controller.enqueue(
                  `data: ${JSON.stringify({
                    type: "text",
                    content: output.contentBlockDelta.delta.text,
                  })}\n\n`,
                );
              } else if ("toolUse" in output.contentBlockDelta.delta) {
                controller.enqueue(
                  `data: ${JSON.stringify({
                    type: "toolUse",
                    input: output.contentBlockDelta.delta.toolUse?.input,
                  })}\n\n`,
                );
              }
            } else if (
              "contentBlockStop" in output &&
              output.contentBlockStop
            ) {
              controller.enqueue(
                `data: ${JSON.stringify({
                  type: "contentBlockStop",
                  index: output.contentBlockStop.contentBlockIndex,
                })}\n\n`,
              );
            } else if ("messageStop" in output && output.messageStop) {
              controller.enqueue(
                `data: ${JSON.stringify({
                  type: "messageStop",
                  stopReason: output.messageStop.stopReason,
                  additionalModelResponseFields:
                    output.messageStop.additionalModelResponseFields,
                })}\n\n`,
              );
            } else if ("metadata" in output && output.metadata) {
              controller.enqueue(
                `data: ${JSON.stringify({
                  type: "metadata",
                  usage: output.metadata.usage,
                  metrics: output.metadata.metrics,
                  trace: output.metadata.trace,
                })}\n\n`,
              );
            }
          }
          controller.close();
        } catch (error) {
          if (error instanceof ValidationException) {
            controller.enqueue(
              `data: ${JSON.stringify({
                type: "error",
                error: "ValidationException",
                message: error.message,
              })}\n\n`,
            );
          } else if (error instanceof ModelStreamErrorException) {
            controller.enqueue(
              `data: ${JSON.stringify({
                type: "error",
                error: "ModelStreamErrorException",
                message: error.message,
                originalStatusCode: error.originalStatusCode,
                originalMessage: error.originalMessage,
              })}\n\n`,
            );
          } else if (error instanceof ThrottlingException) {
            controller.enqueue(
              `data: ${JSON.stringify({
                type: "error",
                error: "ThrottlingException",
                message: error.message,
              })}\n\n`,
            );
          } else if (error instanceof ServiceUnavailableException) {
            controller.enqueue(
              `data: ${JSON.stringify({
                type: "error",
                error: "ServiceUnavailableException",
                message: error.message,
              })}\n\n`,
            );
          } else if (error instanceof InternalServerException) {
            controller.enqueue(
              `data: ${JSON.stringify({
                type: "error",
                error: "InternalServerException",
                message: error.message,
              })}\n\n`,
            );
          } else {
            controller.enqueue(
              `data: ${JSON.stringify({
                type: "error",
                error: "UnknownError",
                message:
                  error instanceof Error ? error.message : "Unknown error",
              })}\n\n`,
            );
          }
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[Bedrock] Request error:", error);
    throw error;
  }
}
