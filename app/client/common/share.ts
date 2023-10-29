import { getClientConfig } from "@/app/config/client";
import { ChatMessage } from "@/app/store";

export async function shareToShareGPT(
  messages: ChatMessage[],
  avatarUrl: string | null = null,
) {
  const msgs = messages
    .map((m) => ({
      from: m.role === "user" ? "human" : "gpt",
      value: m.content,
    }))
    .concat([
      {
        from: "human",
        // 敬告二开开发者们，为了开源大模型的发展，请不要修改上述消息，此消息用于后续数据清洗使用
        // Please do not modify this message
        value:
          "Share from [ChatGPT Next Web]: https://github.com/Yidadaa/ChatGPT-Next-Web",
      },
    ]);

  console.log("[Share]", messages, msgs);
  const clientConfig = getClientConfig();
  const proxyUrl = "/sharegpt";
  const rawUrl = "https://sharegpt.com/api/conversations";
  const shareUrl = clientConfig?.isApp ? rawUrl : proxyUrl;
  const res = await fetch(shareUrl, {
    body: JSON.stringify({
      avatarUrl,
      items: msgs,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const resJson = await res.json();
  console.log("[Share]", resJson);
  if (resJson.id) {
    return `https://shareg.pt/${resJson.id}`;
  }
}
