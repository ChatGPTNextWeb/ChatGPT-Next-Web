import { NextRequest } from "next/server";
import {
  getCompletionCost,
  getPromptCost,
  getRatio,
} from "@/app/utils/tokenizer";

export const OPENAI_URL = "api.openai.com";
const DEFAULT_PROTOCOL = "https";
const PROTOCOL = process.env.PROTOCOL ?? DEFAULT_PROTOCOL;
const BASE_URL = process.env.BASE_URL ?? OPENAI_URL;

export async function requestOpenai(req: NextRequest, mask: string) {
  const controller = new AbortController();
  const authValue = req.headers.get("Authorization") ?? "";
  const openaiPath = `${req.nextUrl.pathname}${req.nextUrl.search}`.replaceAll(
    "/api/openai/",
    "",
  );

  let baseUrl = BASE_URL;

  if (!baseUrl.startsWith("http")) {
    baseUrl = `${PROTOCOL}://${baseUrl}`;
  }

  console.log("[Proxy] ", openaiPath);
  console.log("[Base Url]", baseUrl);

  if (process.env.OPENAI_ORG_ID) {
    console.log("[Org ID]", process.env.OPENAI_ORG_ID);
  }

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 10 * 60 * 1000);

  // 获取上文已消耗的字符数
  const body = await req.json();
  const promptCost = await getPromptCost(body.model, body.messages);

  try {
    const res = await fetch(`${baseUrl}/${openaiPath}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: authValue,
        ...(process.env.OPENAI_ORG_ID && {
          "OpenAI-Organization": process.env.OPENAI_ORG_ID,
        }),
      },
      cache: "no-store",
      method: req.method,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    // 如果请求失败 或者 stream 为 false 直接返回
    if (!res.ok || !body.stream) {
      const bd = !body.stream ? await res.json() : {};
      if (!body.stream) {
        const tokens = bd.usage.total_tokens;
        handleTokenCost(mask, {
          tokens: tokens,
          cost: tokens * getRatio(body.model, false),
        });
      }
      if (res.status === 401) {
        // to prevent browser prompt for credentials
        res.headers.delete("www-authenticate");
      }
      return new Response(!body.stream ? JSON.stringify(bd) : res.body, {
        status: res.status,
        statusText: res.statusText,
        headers: res.headers,
      });
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder("utf-8");
    const encoder = new TextEncoder();

    let partialStr = "";
    let completeStr = "";
    return new Response(
      new ReadableStream({
        async start(controller) {
          const msg = `event: cost\ndata: ${JSON.stringify(promptCost)}\n\n`;
          controller.enqueue(encoder.encode(msg));
        },
        async pull(controller) {
          const { done, value } = await reader.read();
          //TODO 这个 signal 目前是无效的，无法感知到客户端的 abort()
          if (done || req.signal.aborted) {
            for (const data of partialStr.split("\n\n").slice(0, -1)) {
              const sub = data.substring(6);
              if (sub.startsWith("[DONE]")) {
                const completeCost = await getCompletionCost(
                  body.model,
                  completeStr,
                );
                const finalCost = {
                  tokens: promptCost.tokens + completeCost.tokens,
                  cost: promptCost.cost + completeCost.cost,
                };
                handleTokenCost(mask, finalCost);
                controller.enqueue(
                  encoder.encode(
                    `event: cost\ndata: ${JSON.stringify(finalCost)}\n\n`,
                  ),
                );
                controller.enqueue(encoder.encode(data));
              } else {
                const content = JSON.parse(data.substring(5)).choices[0].delta
                  .content;
                if (content) {
                  completeStr += content;
                }
                controller.enqueue(
                  encoder.encode(content ? "data: " + content + "\n\n" : ""),
                );
              }
            }
            controller.close();
            return;
          }
          partialStr += decoder.decode(value, { stream: true });
          const si = partialStr.indexOf("\n\n");
          if (si !== -1 && si !== partialStr.length - 2) {
            // 待处理的数据
            const data = partialStr.slice(0, si + 2);
            partialStr = partialStr.substring(si + 2);
            const content = JSON.parse(data.substring(6)).choices[0].delta
              .content;
            if (content) {
              completeStr += content;
            }
            controller.enqueue(
              encoder.encode(content ? "data: " + content + "\n\n" : ""),
            );
          } else controller.enqueue(encoder.encode(""));
        },
      }),
      {
        headers: res.headers,
      },
    );
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      console.log("Fetch aborted");
    } else {
      throw err;
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

// 处理 TOKEN 消耗记录
function handleTokenCost(mask: string, cost: { tokens: number; cost: number }) {
  // TODO
  console.log(`[Token Cost] ${mask} ${JSON.stringify(cost)}`);
}
