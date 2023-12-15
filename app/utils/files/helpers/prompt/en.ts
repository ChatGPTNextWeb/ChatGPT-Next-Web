export const BASE_PROMPT = "";

export const SINGLE_FILE_PROMPT = `${BASE_PROMPT} The complete document is provided below. After reviewing the document, please respond with "I have finished reviewing the document and I'm ready to assist you with your inquiries."`;

export const LAST_PART_PROMPT = `This is the final segment of the document.\nPlease carefully review all parts of the document that have been provided in this conversation before summarizing or answering any questions about it. Once you have reviewed all sections of the document, please respond with "I have finished reviewing the document and I'm ready to assist you with your inquiries."`;

export const MULTI_PART_FILE_PROMPT = `The document, that I'm about to share, will be divided into several parts. I request that you wait until all parts have been provided before summarizing or answering any questions about it. In the meantime, please respond with "Acknowledged, I will wait for all parts before proceeding."`;

export const MULTI_PART_FILE_UPLOAD_PROMPT = `This is one of several parts of the document.\nPlease wait until all parts have been provided before summarizing or answering any questions about it. For now, please respond with "Acknowledged, I'm waiting for the remaining parts."`;
