import type { ChatRequest } from "../chat/typing";
import { createParser } from "eventsource-parser";
import { NextRequest } from "next/server";

const apiKey = process.env.OPENAI_API_KEY;

async function createStream(payload: ChatRequest) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  console.log("[ChatStream]", payload);

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    method: "POST",
    body: JSON.stringify(payload),
  });

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
        parser.feed(decoder.decode(chunk));
      }
    },
  });
  return stream;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequest;
    const stream = await createStream(body);
    return new Response(stream);
  } catch (error) {
    console.error(error);
  }
}

export const config = {
  runtime: "edge",
};
