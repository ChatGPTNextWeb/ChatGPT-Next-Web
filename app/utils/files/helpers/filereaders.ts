const readFileAsArrayBuffer = (file: File | Blob): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target?.result as ArrayBuffer);
    };
    reader.onerror = (event) => {
      reject(event.target?.error);
    };
    reader.readAsArrayBuffer(file);
  });
};

const readWordFile = async (file: File | Blob): Promise<string> => {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const { default: JSZip } = await import("jszip");
  const zip = await JSZip.loadAsync(arrayBuffer);
  const content = await zip.file("word/document.xml")?.async("text");
  return content
    ? extractTextFromWordXML(content)
    : Promise.reject("Failed to read Word file content");
};

const readExcelFile = async (file: File | Blob): Promise<string> => {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const { read, utils } = await import("xlsx");
  const data = new Uint8Array(arrayBuffer);
  const workbook = read(data, { type: "array" });
  const sheetNames = workbook.SheetNames;
  const extractedTextArray: string[] = [];
  for (const sheetName of sheetNames) {
    extractedTextArray.push("Sheet: " + sheetName + "\n");
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = utils.sheet_to_json(worksheet, { header: 1 });
    extractedTextArray.push(extractTextFromExcelData(jsonData as any[][]));
  }
  return extractedTextArray.join("\n");
};

const readPdfFile = async (file: File | Blob): Promise<string> => {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = require("pdfjs-dist/build/pdf.worker.min.mjs");
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let textContent = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const text = await page.getTextContent();
    textContent += text.items.map((item: any) => item.str).join(" ");
  }

  pdf.destroy();
  return textContent;
};

const readImageFiles = async (file: File): Promise<string> => {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng+chi_sim");
  await worker.load();
  const {
    data: { text },
  } = await worker.recognize(file);
  await worker.terminate();
  return text;
};

const readFilesFromZIPFile = async (
  zipFile: File,
  blacklist: string[],
  ignoreExtensions: string[],
): Promise<string> => {
  const files = new Map<string, string>();
  const zipData = await readFileAsArrayBuffer(zipFile);
  const { default: JSZip } = await import("jszip");
  const zip = await JSZip.loadAsync(zipData);

  await Promise.allSettled(
    Object.values(zip.files).map(async (file) => {
      const fileName = file.name;
      const fileExtension =
        "." + fileName.split(".").pop()?.toLowerCase() || "";

      if (
        !file.dir &&
        !fileName.startsWith("__MACOSX/") &&
        !blacklist.includes(fileName) &&
        !ignoreExtensions.includes(fileExtension)
      ) {
        let fileContent = "";
        const fileContentArrayBuffer = await file.async("arraybuffer");
        const fileContentAsBlob = new Blob([fileContentArrayBuffer]);

        if (fileExtension === ".pdf") {
          fileContent = await readPdfFile(fileContentAsBlob);
        } else if (fileExtension === ".docx") {
          fileContent = await readWordFile(fileContentAsBlob);
        } else if (fileExtension === ".xlsx") {
          fileContent = await readExcelFile(fileContentAsBlob);
        } else {
          fileContent = await file.async("string");
        }

        files.set(file.name, fileContent);
      }
    }),
  );

  let outputText = "";

  for (const [filePath, fileContent] of files.entries()) {
    outputText += `\nFile: ${filePath}\n`;
    outputText += `${fileContent}\n\n`;
  }

  return outputText;
};

function extractTextFromWordXML(xmlContent: string) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
  const textNodes = xmlDoc.getElementsByTagName("w:t");
  let extractedText = "";

  for (let i = 0; i < textNodes.length; i++) {
    extractedText += textNodes[i].textContent + " \n";
  }

  return extractedText;
}

function extractTextFromExcelData(data: any[][]): string {
  let extractedText = "";

  for (const row of data) {
    for (const cell of row) {
      if (cell && typeof cell === "string") {
        extractedText += cell + " ";
      }
    }
    extractedText += "\n";
  }

  return extractedText;
}

export {
  readFilesFromZIPFile,
  readPdfFile,
  readWordFile,
  readExcelFile,
  readImageFiles,
};
