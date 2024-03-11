const axios = require("axios");

//
export function generateRandomToken(length: number): string {
  const characters: string =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token: string = "";
  for (let i: number = 0; i < length; i++) {
    const randomIndex: number = Math.floor(Math.random() * characters.length);
    token += characters[randomIndex];
  }
  return token;
}
export async function getPathVidStream(): Promise<any> {
  try {
    const res = await axios.get("/api/hippo/stream");
    return res.data;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function saveToVectorDatabase(text) {
  try {
    await searchPathVid(text);
    //
    const userId = localStorage.getItem("userId");
    const res = await axios.post("/api/hippo/save", {
      text: text,
      userId: userId,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
}
export async function searchPathVid(text) {
  const res = await axios.post("/api/hippo/search/pathVid", {
    text: text,
  });
  const dataPathResult = res.data.collection[0].metadata.url;
  localStorage.setItem("pathVidStream", dataPathResult);
  return res.data;
}
export async function searchFromVectorDatabase(requestPayload) {
  try {
    const requestPayloads = requestPayload;
    const userId = localStorage.getItem("userId");
    const statusRag = localStorage.getItem("statusRag");

    const res = await axios.post("/api/hippo/search/content", {
      requestPayload: requestPayloads,
      userId: userId,
      statusRag: statusRag,
    });
    console.log("resdaa", res.data);
    return res.data;
  } catch (error) {
    console.log(error);
  }
}
