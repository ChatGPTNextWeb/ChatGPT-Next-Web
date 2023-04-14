import { createParser } from "eventsource-parser";
import { NextRequest } from "next/server";
import { requestOpenai } from "../common";
import clientPromise from "../../db/mongdb";

async function createStream(req: NextRequest) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const res = await requestOpenai(req);

  const contentType = res.headers.get("Content-Type") ?? "";
  if (!contentType.includes("stream")) {
    const content = await (
      await res.text()
    ).replace(/provided:.*. You/, "provided: ***. You");
    console.log("[Stream] error ", content);
    return "```json\n" + content + "```";
  }

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

export async function POST(req: NextRequest) {
  const accessCode = req.headers.get("access-code");
  try {
    // // 使用 clientPromise 连接到 MongoDB 数据库
    // const client = await clientPromise;
    // // 选择数据库和集合
    // const db = client.db("chat_db");
    // const usersCollection = db.collection("users");
    // // 查询用户数据
    // const user = await usersCollection.findOne({ key: accessCode });
    // console.log(user, accessCode);
    // const tips =
    //   "您的链接授权已过期，为了避免恶意盗刷，\n 请关注微信公众号【coder思维】\n回复关键词：`ai`  获取授权链接 \n ![](/wx.png)";
    // if (!user) {
    //   return new Response(tips);
    // }
    // console.log("compare: ");
    // console.log(
    //   user["expire"] < new Date().getTime(),
    //   user["expire"],
    //   new Date().getTime(),
    // );
    // if (user["expire"] < new Date().getTime()) {
    //   // 判断用户是否过期
    //   return new Response(tips);
    // }

    // // 创建查询条件
    // // 计算24小时前的时间戳
    // const currentTime = new Date();
    // const startTime = new Date(currentTime.getTime() - 24 * 60 * 60 * 1000);

    // // 创建查询条件
    // const query = {
    //   username: user["username"],
    //   create_time: { $gte: startTime },
    // };

    // const collection = db.collection("chat_logs");
    // // 根据查询条件查询记录数
    // const recordCount = await collection.countDocuments(query);
    // if (recordCount > 1000) {
    //   // 判断用户是否超过1000条记录
    //   return new Response(
    //     "您的聊天提问已超过1000条，为了避免恶意盗刷，请过稍后再试，24小时内只能提问1000条",
    //   );
    // }
    // // 创建聊天记录
    // const chatLog = {
    //   username: user["username"],
    //   create_time: new Date().getTime(),
    //   content: req.body,
    // };
    // collection.insertOne(chatLog).then(() => {
    //   //client.close();
    // });

    const stream = await createStream(req);
    return new Response(stream);
  } catch (error) {
    console.error("[Chat Stream]", error);
    return new Response(
      ["```json\n", JSON.stringify(error, null, "  "), "\n```"].join(""),
    );
  }
}
