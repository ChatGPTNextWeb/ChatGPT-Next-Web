const axios = require("axios");
import jsonWorkFlow from "./workflComfy/text2image.json";

//
export function generateRandomToken(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    token += characters[randomIndex];
  }
  return token;
}

export async function saveToVectorDatabase(text) {
  try {
    const userId = localStorage.getItem("userId");
    const data = {
      collection_name: userId,
      data: text,
      data_type: "text",
    };
    const result = await axios.post(process.env.SAVETOVECTORDATABASE, data);
    return result.data.message;
  } catch (error) {
    console.log(error);
  }
}
async function searchPathVid() {
  const lastinput = localStorage.getItem("last-input");
  const data = {
    collection_name: "collection_video_test",
    data: lastinput,
    collect_meta: "true",
  };
  const result = await axios.post(process.env.SEARCHFROMVECTORDATABASE, data);
  const dataPathResult = result.data.collection[0].metadata.url;
  localStorage.setItem("pathVidStream", dataPathResult);
}
export async function searchFromVectorDatabase(requestPayload) {
  try {
    // search pathVidTream
    await searchPathVid();
    // search data to query
    const userId = localStorage.getItem("userId");
    const statusRag = localStorage.getItem("statusRag");

    const messages = requestPayload.messages;
    const lastMessage = messages[messages.length - 1];

    if (lastMessage.role === "user" && statusRag === "1") {
      const data = {
        collection_name: userId,
        data: lastMessage.content,
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

      return requestPayload;
    } else {
      return requestPayload;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function handleComfyui() {
  const headers = {
    "Content-Type": "application/json",
    Authorization: process.env.TOKENHIPPO,
  };
  jsonWorkFlow[6].inputs.text = `${generateRandomToken(5)}${
    jsonWorkFlow[6].inputs.text
  }${generateRandomToken(5)}`;

  const result = await axios.post(
    process.env.POSTQUEUECOMFYUI,
    {
      jsonWl: jsonWorkFlow,
    },
    { headers },
  );
  return result.data.message;
}
