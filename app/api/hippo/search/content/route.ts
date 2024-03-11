import { NextResponse } from "next/server";
const axios = require("axios");

export async function POST(request: Request) {
  try {
    const json = await request.json();

    let userId = json.userId;
    let statusRag = json.statusRag;
    let requestPayload = json.requestPayload;

    const messages = requestPayload.messages;
    const lastMessage = messages[messages.length - 1];

    if (lastMessage.role === "user" && statusRag === "1") {
      const data = {
        collection_name: userId,
        data: lastMessage.content,
        data_type: "text",
      };

      const result = await axios.post(
        process.env.SEARCHFROMVECTORDATABASE,
        data,
      );
      const resultData = result.data.collection;
      // dataSearch -> context
      let context = "";
      let firstIteration = true;
      for (let key in resultData) {
        if (firstIteration) {
          context = resultData[key];
          firstIteration = false;
        } else {
          context = `${context}, ${resultData[key]}`;
        }
      }
      // form rag
      lastMessage.content = `
      You are a Q&A expert system. Your responses must always be rooted in the context provided for each query. Here are some guidelines to follow:
      1. Refrain from explicitly mentioning the context provided in your response.
      2. The context should silently guide your answers without being directly acknowledged.
      3. Do not use phrases such as 'According to the context provided', 'Based on the context, ...' etc.
      Context information:
      ----------------------
      ${context}
      ----------------------
      Query: ${lastMessage.content}
      Answer:
      """
      `;
      //
      return NextResponse.json(requestPayload, { status: 200 });
    } else {
      return NextResponse.json(requestPayload, { status: 200 });
    }
  } catch (e) {
    console.log(e);
  }
}
