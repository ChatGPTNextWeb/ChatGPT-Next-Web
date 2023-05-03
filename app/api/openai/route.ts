import { createParser } from "eventsource-parser";
import { NextRequest, NextResponse } from "next/server";
import { requestOpenai } from "../common";

async function createStream(res: Response) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      function onParse(event: any) {
        if (event.type === "event") {
          const data = event.data;
          // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      }

      const parser = createParser(onParse);
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk, { stream: true }));
      }
    },
  });
  return stream;
}

function formatResponse(msg: any) {
  const jsonMsg = ["```json\n", JSON.stringify(msg, null, "  "), "\n```"].join(
    "",
  );
  return new Response(jsonMsg);
}

async function makeRequest(req: NextRequest) {
  try {
    const api = await requestOpenai(req);

    const contentType = api.headers.get("Content-Type") ?? "";

    // streaming response
    if (contentType.includes("stream")) {
      const stream = await createStream(api);
      return new Response(stream);
    }

    // try to parse error msg
    try {
      const mayBeErrorBody = await api.json();
      if (mayBeErrorBody.error) {
        console.error("[OpenAI Response] ", mayBeErrorBody);
        return formatResponse(mayBeErrorBody);
      } else {
        const res = new Response(JSON.stringify(mayBeErrorBody));
        res.headers.set("Content-Type", "application/json");
        res.headers.set("Cache-Control", "no-cache");
        return res;
      }
    } catch (e) {
      console.error("[OpenAI Parse] ", e);
      return formatResponse({
        msg: "invalid response from openai server",
        error: e,
      });
    }
  } catch (e) {
    console.error("[OpenAI] ", e);
    return formatResponse(e);
  }
}

export async function POST(req: NextRequest) {
  return makeRequest(req);
}

export async function GET(req: NextRequest) {
  return makeRequest(req);
}

export const runtime = "edge";
