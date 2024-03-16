import { PDFLoader } from "langchain/document_loaders/fs/pdf";

interface InputProps {
  fileType: "text" | "url" | "youtube" | "pdf" | "notion";
  file: string;
}

const ContentLoader = async (props: InputProps) => {
  if (props.fileType === "pdf") {
    const loader = new PDFLoader(`uploads/${props.file}`, {
      splitPages: false,
    });

    const docs = await loader.load();
    let contents = "";
    docs.map((doc) => {
      contents += " " + doc.pageContent;
    });
    return contents;
  }
};

export { ContentLoader };

export type { InputProps };
