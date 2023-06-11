import URLProcessor from "./URLProcessor";

const BASEURL = `http://${URLProcessor.getCurURLHost()}/api/v1/`;

/** This class is used to access response generated from ChatGPT */
export default class ResponseController {
  /** Get an `assistant` response based on the provided input
   * @param msg user input message
   */
  static async getConvResponse(msg: string) {
    const controller = new AbortController();
    const timeout = 6000; // 设置超时时间为 1 分钟（60 秒）

    setTimeout(() => {
      controller.abort(); // 超时后中止请求
    }, timeout);

    try {
      const response = await fetch(BASEURL + "getresponse", {
        method: "POST",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
        mode: "cors",
        signal: controller.signal, // 关联 AbortController
        body: JSON.stringify({
          message: msg,
        }),
      });

      return response.json();
    } catch (error) {
      // @ts-ignore
      if (error.name === "AbortError") {
        // 请求超时处理
        throw new Error("请求超时");
      } else {
        // 其他错误处理
        throw error;
      }
    }
  }

  /** Get a difference between sentences discovered by ChatGPT
   * @param original original sentence
   * @param edited edited sentence
   * @param maxTokens maximum tokens for ChatGPT
   * @returns json data
   */
  static async getDiffResponse(
    original: string,
    edited: string,
    maxTokens = 50,
  ) {
    let response = await fetch(BASEURL + "getdifference", {
      method: "POST",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: [original, edited],
        max_tokens: maxTokens,
        temperature: 0.5,
      }),
    });

    const data = await response.json();
    return data;
  }

  /**
   * Get an instruction from ChatGPT on how to change one sentence to edited sentence
   * @param original original sentence
   * @param edited edited sentence
   * @returns json data
   */
  static async getHowToChange(
    original: string,
    edited: string,
    maxTokens = 50,
    temperature = 0.7,
  ) {
    let response = await fetch(BASEURL + "gethowtochange", {
      method: "POST",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: [original, edited],
        max_tokens: maxTokens,
        temperature: temperature,
      }),
    });

    const data = await response.json();
    return data;
  }

  /**
   * Submit the change to ChatGPT
   * @param userInput the user input ChatGPT used for generating response
   * @param original the original response ChatGPT used
   * @param edited the new response ChatGPT should use in the future
   * @returns json data
   */
  static async makeChange(
    userInput: string,
    original: string,
    edited: string,
    maxTokens = 50,
    temperature = 0.5,
  ) {
    let response = await fetch(BASEURL + "makechange", {
      method: "POST",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prevUserIn: userInput,
        prompt: [original, edited],
        max_tokens: maxTokens,
        temperature: temperature,
      }),
    });

    const data = await response.json();
    return data;
  }

  /**
   * Submit a prompt guide in PDF format for ChatGPT to use
   * @param formData
   * @returns json data
   */
  static async postPDFprompt(formData: FormData) {
    let response = await fetch(BASEURL + "appendPDFPrompt", {
      method: "POST",
      mode: "cors", // 添加跨域请求模式
      body: formData,
    });

    const data = await response.json();
    return data;
  }
}
