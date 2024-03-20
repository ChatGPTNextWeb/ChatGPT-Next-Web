export async function genRagMsg(lastMessage: any, userId: any) {
  try {
    if (lastMessage.role === "user") {
      const data = {
        collection_name: userId,
        data: lastMessage.content,
        data_type: "text",
      };

      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      };
      const response = await fetch(
        `${process.env.SEARCHFROMVECTORDATABASE}`,
        requestOptions,
      );
      const result = await response.json();

      const resultData = result.collection;
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
      return `
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
    }
  } catch (e) {
    console.log(e);
  }
}
