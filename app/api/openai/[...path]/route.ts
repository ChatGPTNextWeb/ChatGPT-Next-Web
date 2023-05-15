import { createParser } from "eventsource-parser";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../auth";
import { requestOpenai } from "../../common";
import { recordTokenUsage } from "../../lib/redis";
import { countToken, promptToken } from "../../lib/tokenlize";

async function recordTokens(
  accessCode: string,
  requestMessage: any,
  resonseContent: string,
) {
  const responseToken = countToken(resonseContent);
  const requestToken = promptToken(requestMessage.messages);
  if (responseToken > 0 || requestToken > 0) {
    return recordTokenUsage(accessCode, requestToken, responseToken);
  }
}

async function createStream(res: Response, onDone: (content: string) => void) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  var resonseContent: string = "";

  const stream = new ReadableStream({
    async start(controller) {
      function onParse(event: any) {
        if (event.type === "event") {
          const data = event.data;
          // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
          if (data === "[DONE]") {
            controller.close();
            onDone(resonseContent);
          }
          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;
            resonseContent = resonseContent + text;
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

async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  console.log("[OpenAI Route] params ", params);

  const authResult = await auth(req);
  if (authResult.error) {
    return NextResponse.json(authResult, {
      status: 401,
    });
  }
  const accessCode = authResult.accessCode;

  try {
    const reuqestMessages = await req.json();

    const api = await requestOpenai(req, reuqestMessages);

    const contentType = api.headers.get("Content-Type") ?? "";

    // streaming response
    if (contentType.includes("stream")) {
      const stream = await createStream(api, (messageContent) => {
        recordTokens(accessCode, reuqestMessages, messageContent);
      });

      const res = new Response(stream);
      res.headers.set("Content-Type", contentType);
      return res;
    }

    // try to parse error msg
    try {
      const mayBeErrorBody = await api.json();
      if (mayBeErrorBody.error) {
        console.error("[OpenAI Response] ", mayBeErrorBody);
        return formatResponse(mayBeErrorBody);
      } else {
        const res = new Response(JSON.stringify(mayBeErrorBody));
        const messageContent = mayBeErrorBody.choices[0].message.content;
        recordTokens(accessCode, reuqestMessages, messageContent);
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

export const GET = handle;
export const POST = handle;

export const runtime = "nodejs";
