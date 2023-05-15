// try {
//     require('gpt-3-encoder')
// } catch (e) {
//     console.log(e)
// }

import { encode } from "gpt-3-encoder";

export function countToken(str: string): number {
  if (str && str.length > 0) {
    return encode(str).length;
  } else {
    return 0;
  }
}

// see: https://github.com/openai/openai-cookbook/blob/main/examples/How_to_count_tokens_with_tiktoken.ipynb
export function promptToken(
  messages: [{ role: string; content: string }],
): number {
  const tokens = messages.map((m) => countToken(m.content));
  return tokens.reduce((a, b) => a + b, 0);
}
