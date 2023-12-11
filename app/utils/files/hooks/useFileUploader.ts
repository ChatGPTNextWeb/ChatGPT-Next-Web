import {
  getFromLocalStorage,
  removeItemFromLocalStorage,
  saveToLocalStorage,
} from "../helpers";
import {
  DEFAULT_CHUNCK_SIZE,
  IMAGE_FILE_TYPES,
  ZIP_BLACKLIST,
  ZIP_IGNORE_EXTENSION,
  WAIT_TIME,
  DEFAULT_OVERLAP_SIZE,
} from "../helpers/constants";
import {
  BASE_PROMPT,
  LAST_PART_PROMPT,
  MULTI_PART_FILE_PROMPT,
  SINGLE_FILE_PROMPT,
  MULTI_PART_FILE_UPLOAD_PROMPT,
} from "../helpers/prompt/en";

import {
  readPdfFile,
  readWordFile,
  readExcelFile,
  readFilesFromZIPFile,
  readImageFiles,
} from "../helpers/filereaders";
import { useEffect, useRef, useState } from "react";

const getPrompts = (lang?: string) => {
  let prompts = {
    BASE_PROMPT,
    LAST_PART_PROMPT,
    MULTI_PART_FILE_PROMPT,
    SINGLE_FILE_PROMPT,
    MULTI_PART_FILE_UPLOAD_PROMPT,
  };
  if (lang === "cn") {
    prompts = require("../helpers/prompt/cn");
  }
  return prompts;
};

export type Options = {
  lang?: string;
  onSubmitConversation: (
    prompt: string,
    context?: {
      currentPart: number;
      totalParts: number;
    },
  ) => Promise<void> | void;
};

const useFileUploader = (options: Options) => {
  const prompts = getPrompts(options.lang);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [chunkSize, setChunkSize] = useState<number>(DEFAULT_CHUNCK_SIZE);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isParseing, setIsParseing] = useState<boolean>(false);
  const [currentPart, setCurrentPart] = useState<number>(0);
  const [totalParts, setTotalParts] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [conversationWithPromptList, setConversationWithPromptList] = useState<
    string[]
  >([]);

  const [basePrompt, setBasePrompt] = useState<string>(prompts.BASE_PROMPT);
  const [singleFilePrompt, setSingleFilePrompt] = useState<string>(
    prompts.SINGLE_FILE_PROMPT,
  );
  const [multipleFilesPrompt, setMultipleFilesPrompt] = useState<string>(
    prompts.MULTI_PART_FILE_PROMPT,
  );
  const [multipleFilesUpPrompt, setMultipleFilesUpPrompt] = useState<string>(
    prompts.MULTI_PART_FILE_UPLOAD_PROMPT,
  );
  const [lastPartPrompt, setLastPartPrompt] = useState<string>(
    prompts.LAST_PART_PROMPT,
  );

  const onBasePromptChange = (value: string) => {
    setBasePrompt(value);
    saveToLocalStorage("basePrompt", value);
  };
  const onSingleFilePromptChange = (value: string) => {
    setSingleFilePrompt(value);
    saveToLocalStorage("singleFilePrompt", value);
  };
  const onMultipleFilesPromptChange = (value: string) => {
    setMultipleFilesPrompt(value);
    saveToLocalStorage("multipleFilesPrompt", value);
  };
  const onMultipleFilesUpPromptChange = (value: string) => {
    setMultipleFilesUpPrompt(value);
    saveToLocalStorage("multipleFilesUpPrompt", value);
  };
  const onLastPartPromptChange = (value: string) => {
    setLastPartPrompt(value);
    saveToLocalStorage("lastPartPrompt", value);
  };

  const [blacklist, setBlacklist] = useState<string[]>(ZIP_BLACKLIST);
  const [ignoreExtensions, setIgnoreExtensions] =
    useState<string[]>(ZIP_IGNORE_EXTENSION);

  const isStopRequestedRef = useRef(false);
  const [isStopRequested, setIsStopRequested] = useState(false);
  const [overlapSize, setOverlapSize] = useState(DEFAULT_OVERLAP_SIZE);

  const getSettingsFromLocalStorage = () => {
    const localChunkSize = getFromLocalStorage("chunkSize");

    const localOverlapSize = getFromLocalStorage("overlapSize");

    const localBasePrompt = getFromLocalStorage("basePrompt");

    const localSingleFilePrompt = getFromLocalStorage("singleFilePrompt");

    const localMultipleFilesPrompt = getFromLocalStorage("multipleFilesPrompt");

    const localLastPartPrompt = getFromLocalStorage("lastPartPrompt");

    const localMultipleFilesUpPrompt = getFromLocalStorage(
      "multipleFilesUpPrompt",
    );

    const localBlacklist = getFromLocalStorage("blacklist");

    const localIgnoreExtensions = getFromLocalStorage("ignoreExtensions");

    if (localBlacklist) {
      setBlacklist(localBlacklist.split(","));
    }

    if (localIgnoreExtensions) {
      setIgnoreExtensions(localIgnoreExtensions.split(","));
    }

    if (localChunkSize) {
      setChunkSize(parseInt(localChunkSize));
    }

    if (localBasePrompt) {
      setBasePrompt(localBasePrompt);
    }

    if (localSingleFilePrompt) {
      setSingleFilePrompt(localSingleFilePrompt);
    }

    if (localMultipleFilesPrompt) {
      setMultipleFilesPrompt(localMultipleFilesPrompt);
    }

    if (localLastPartPrompt) {
      setLastPartPrompt(localLastPartPrompt);
    }

    if (localMultipleFilesUpPrompt) {
      setMultipleFilesUpPrompt(localMultipleFilesUpPrompt);
    }

    if (localOverlapSize) {
      setOverlapSize(Number(localOverlapSize));
    }
  };

  const updateBlackListAndIgnoreExtensions = async () => {
    saveToLocalStorage("blacklist", blacklist.join(","));
    saveToLocalStorage("ignoreExtensions", ignoreExtensions.join(","));
  };

  async function file2ConversationWithPrompt(file: File) {
    getSettingsFromLocalStorage();
    setIsParseing(true);
    setConversationWithPromptList([]);
    let fileContent = "";
    const handleFileContent = async (fileContent: string) => {
      const splitToDocuments = async (
        text: string,
        chunkSize: number,
      ): Promise<string[]> => {
        const { RecursiveCharacterTextSplitter } = await import(
          "langchain/text_splitter"
        );
        const { Document } = await import("langchain/document");
        const splitter = new RecursiveCharacterTextSplitter({
          chunkSize: chunkSize ?? DEFAULT_CHUNCK_SIZE,
          chunkOverlap: overlapSize ?? DEFAULT_OVERLAP_SIZE,
        });
        const docOutput = await splitter.splitDocuments([
          new Document({ pageContent: text }),
        ]);
        return docOutput.map((doc) => doc.pageContent);
      };
      const splittedDocuments = await splitToDocuments(fileContent, chunkSize);
      setCurrentPart(0);
      setTotalParts(splittedDocuments.length);
      const conversationWithPromptList =
        conversationWithPrompt(splittedDocuments);
      setConversationWithPromptList(conversationWithPromptList);
    };
    try {
      if (file.type === "application/pdf") {
        fileContent = await readPdfFile(file);
      } else if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        fileContent = await readWordFile(file);
      } else if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        fileContent = await readExcelFile(file);
      } else if (file.type === "application/zip") {
        fileContent = await readFilesFromZIPFile(
          file,
          blacklist,
          ignoreExtensions,
        );
      } else if (IMAGE_FILE_TYPES.exec(file.type)) {
        fileContent = await readImageFiles(file);
      } else if (file.type === "text/plain") {
        fileContent = await readFileAsText(file);
      } else {
        fileContent = await readFileAsText(file);
      }
    } catch (error) {
      console.error(error);
      const errorMessage = `Error occurred while reading file: ${error}`;
      setError(errorMessage);
      clearState();
      return;
    }

    if (fileContent.length === 0 || fileContent === "") {
      const errorMessage = "File content is empty. Aborting...";

      setError(errorMessage);

      clearState();
      return Promise.reject(errorMessage);
    }

    try {
      await handleFileContent(fileContent);
    } catch (error) {
      console.error(error);
      const errorMessage = `Error occurred while submitting file: ${error}`;
      setError(errorMessage);
      clearState();
      return Promise.reject(errorMessage);
    }
  }

  const setTextareaValue = (
    element: HTMLTextAreaElement,
    value: string,
  ): void => {
    const valueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value",
    )?.set;
    const prototype = Object.getPrototypeOf(element);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(
      prototype,
      "value",
    )?.set;

    if (valueSetter && valueSetter !== prototypeValueSetter) {
      prototypeValueSetter?.call(element, value);
    } else {
      valueSetter?.call(element, value);
    }

    element.dispatchEvent(new Event("input", { bubbles: true }));
  };

  const onSubmitConversationDefault = async (value: string): Promise<void> => {
    const textarea = document.getElementById(
      "prompt-textarea",
    ) as HTMLTextAreaElement;

    if (!textarea) {
      return;
    }

    setTextareaValue(textarea, value); // set the new value

    const enterKeyEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      code: "Enter",
      which: 13,
      keyCode: 13,
      bubbles: true,
    });
    await new Promise((resolve) => setTimeout(resolve, 400));
    textarea.dispatchEvent(enterKeyEvent);
  };

  const conversationWithPrompt = (splittedDocuments: string[]) => {
    const totalParts = splittedDocuments.length;
    return splittedDocuments.map((text, i) => {
      const part = i + 1;
      const done = i === splittedDocuments.length - 1;
      const splittedPrompt = `${part === 1 ? basePrompt : ""}
    ${part === 1 ? multipleFilesPrompt : multipleFilesUpPrompt}`;
      const prePrompt =
        totalParts === 1
          ? singleFilePrompt
          : done
          ? lastPartPrompt
          : splittedPrompt;
      const promptFilename = `Filename: ${fileName || "Unknown"}`;
      const promptPart = `Part ${part} of ${totalParts}:`;
      const prompt = `
${prePrompt}
${promptFilename} 
${promptPart}

${text}`;
      return prompt.trim();
    });
  };

  const sendMessage = async () => {
    setIsSubmitting(true);
    setIsStopRequested(false);
    const numChunks = conversationWithPromptList.length;
    const maxTries = 20; // Set max tries to 20
    async function processChunk(i: number) {
      if (i < numChunks && !isStopRequestedRef.current) {
        const value = conversationWithPromptList[i];
        const part = i + 1;
        setCurrentPart(part);
        if (options.onSubmitConversation) {
          const result = options.onSubmitConversation(value, {
            currentPart: part,
            totalParts: numChunks,
          });
          if (result instanceof Promise) {
            await result.catch(() => {
              clearState();
              return Promise.reject();
            });
          }
        } else {
          await onSubmitConversationDefault(value);
        }
        await wait();
        let chatgptReady = false;
        let currentTry = 0; // Initialize the counter
        while (!chatgptReady && !isStopRequestedRef.current) {
          await wait();
          chatgptReady = !document.querySelector(
            ".text-2xl > span:not(.invisible)",
          );
          currentTry += 1; // Increment the counter
          if (isStopRequestedRef.current) {
            break;
          }
        }

        if (currentTry >= maxTries) {
          console.error("Max tries exceeded. Exiting...");
          setError("Max tries exceeded. Exiting...");
          clearState();
          return; // Exit the function or handle this case appropriately
        }

        if (!isStopRequestedRef.current) {
          processChunk(i + 1); // Process the next chunk
        }
      } else {
        clearState();
      }
    }
    processChunk(0); // Start the process with the first chunk
  };

  const clearState = () => {
    setIsSubmitting(false);
    setIsStopRequested(false);
    setFile(null);
    setFileName("");
    setConversationWithPromptList([]);
    setTotalParts(0);
    setCurrentPart(0);
  };

  const wait = (ms?: number) =>
    new Promise((resolve) => setTimeout(resolve, ms ?? WAIT_TIME));

  const readFileAsText = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject("No result found");
        }
      };
      reader.onerror = () => {
        reject(`Error occurred while reading file: ${reader.error}`);
      };
      reader.readAsText(file);
    });
  };

  const handleFileInput = (files: FileList) => {
    if (!isSubmitting && files.length > 0) {
      const selectedFile = files[0];
      setFileName(selectedFile.name);
      setFile(selectedFile);
    }
  };

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFileInput(event.target.files);
    }
    event.target.value = "";
  };

  const onUploadButtonClick = () => {
    if (!isSubmitting) {
      if (fileInputRef.current) {
        fileInputRef.current?.click();
      } else {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "*";
        fileInput.click();
        fileInput.addEventListener("change", (e: any) => {
          onFileChange(e);
        });
      }
    }
  };

  async function onChunkSizeChange(value: string) {
    try {
      let parsedValue = parseInt(value);

      if (isNaN(parsedValue)) {
        return;
      }

      if (parsedValue < 1) {
        parsedValue = 1;
      }

      if (parsedValue > 99999) {
        parsedValue = 99999;
      }

      saveToLocalStorage("chunkSize", String(parsedValue));
      setChunkSize(parsedValue);
    } catch (error) {
      setChunkSize(DEFAULT_CHUNCK_SIZE);
    }
  }

  async function onOverlapSizeChange(value: string) {
    try {
      let parsedValue = parseInt(value);

      if (isNaN(parsedValue)) {
        return;
      }

      if (parsedValue < 1) {
        parsedValue = 1;
      }

      if (parsedValue > 99999) {
        parsedValue = 99999;
      }

      saveToLocalStorage("overlapSize", String(parsedValue));
      setOverlapSize(parsedValue);
    } catch (error) {
      setOverlapSize(DEFAULT_OVERLAP_SIZE);
    }
  }

  const doReset = () => {
    setIsStopRequested(true);
    clearState();
    const prompts = getPrompts(options.lang);
    onBasePromptChange(prompts.BASE_PROMPT);
    removeItemFromLocalStorage("basePrompt");
    onSingleFilePromptChange(prompts.SINGLE_FILE_PROMPT);
    removeItemFromLocalStorage("singleFilePrompt");
    onMultipleFilesPromptChange(prompts.MULTI_PART_FILE_PROMPT);
    removeItemFromLocalStorage("multipleFilesPrompt");
    onMultipleFilesUpPromptChange(prompts.MULTI_PART_FILE_UPLOAD_PROMPT);
    removeItemFromLocalStorage("multipleFilesUpPrompt");
    onLastPartPromptChange(prompts.LAST_PART_PROMPT);
    removeItemFromLocalStorage("lastPartPrompt");
    onChunkSizeChange(String(DEFAULT_CHUNCK_SIZE));
  };

  useEffect(() => {
    isStopRequestedRef.current = isStopRequested;
    if (isStopRequested) {
      setIsSubmitting(false);
      setFile(null);
      setFileName("");
    }
  }, [isStopRequested]);

  useEffect(() => {
    getSettingsFromLocalStorage();
  }, []);

  useEffect(() => {
    if (chunkSize < 1) {
      setChunkSize(DEFAULT_CHUNCK_SIZE);
    }
  }, [chunkSize]);

  useEffect(() => {
    if (error) {
      const metrics = {
        file_type: file?.type || "",
        file_name: fileName,
      };
    }
  }, [error]);

  useEffect(() => {
    if (file) {
      file2ConversationWithPrompt(file).finally(() => {
        setIsParseing(false);
      });
    }
  }, [file]);

  return {
    file,
    fileName,
    isSubmitting,
    isParseing,
    onFileChange,
    onUploadButtonClick,
    fileInputRef,
    currentPart,
    totalParts,
    chunkSize,
    onChunkSizeChange,
    basePrompt,
    singleFilePrompt,
    multipleFilesPrompt,
    lastPartPrompt,
    multipleFilesUpPrompt,
    onBasePromptChange,
    onSingleFilePromptChange,
    onMultipleFilesPromptChange,
    onMultipleFilesUpPromptChange,
    onLastPartPromptChange,
    blacklist,
    ignoreExtensions,
    setIgnoreExtensions,
    setBlacklist,
    updateBlackListAndIgnoreExtensions,
    setIsStopRequested,
    handleFileInput,
    overlapSize,
    onOverlapSizeChange,
    doReset,
    conversationWithPromptList,
    sendMessage,
  };
};

export default useFileUploader;
