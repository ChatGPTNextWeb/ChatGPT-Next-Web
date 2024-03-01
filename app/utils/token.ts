export function estimateTokenLength(input: string): number {
  let tokenLength = 0;

  for (let i = 0; i < input.length; i++) {
    const charCode = input.charCodeAt(i);

    if (charCode < 128) {
      // ASCII character
      if (charCode <= 122 && charCode >= 65) {
        // a-Z
        tokenLength += 0.25;
      } else {
        tokenLength += 0.5;
      }
    } else {
      // Unicode character
      tokenLength += 1.5;
    }
  }

  return tokenLength;
}

// import { get_encoding } from "tiktoken";

// export function getTokenLength(input: string): number {
//   // const { get_encoding } = require( "tiktoken" );
//   // const encoding = get_encoding("cl100k_base");
//
//   const { Tiktoken } = require("tiktoken/lite");
//   const cl100k_base = require("tiktoken/encoders/cl100k_base.json");
//   const encoding = new Tiktoken(
//     cl100k_base.bpe_ranks,
//     cl100k_base.special_tokens,
//     cl100k_base.pat_str,
//   );
//   const tokenLength = encoding.encode(input).length;
//   // console.log('[TOKEN],=========', input, tokenLength)
//
//   return tokenLength;
// }
