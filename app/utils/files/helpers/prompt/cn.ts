export const BASE_PROMPT = "";

export const SINGLE_FILE_PROMPT = `${BASE_PROMPT} 下面提供了完整的文件内容。请在查看完文件内容后回复：“我已经完成了对文件内容的审阅，准备好回答您的问题了。”`;

export const LAST_PART_PROMPT = `这是文件内容的最后一部分。\n在总结或回答任何与文件内容相关的问题之前，请仔细审阅在对话中提供的所有部分。一旦您完成了对文件内容的所有部分的审阅，请回复：“我已经完成了对文件内容的审阅，准备好回答您的问题了。”`;

export const MULTI_PART_FILE_PROMPT = `我将要分享的文件内容会分为几个部分。在总结或回答任何与文件内容相关的问题之前，请等待所有部分都已提供。现在，请回复：“已收到，我会等待所有部分再继续。”`;

export const MULTI_PART_FILE_UPLOAD_PROMPT = `这是文件内容的其中一部分。\n请等待所有部分都已提供后再总结或回答任何与文件内容相关的问题。现在，请回复：“已收到，我正在等待剩余的部分。”`;
