import { ChatActions as Actions } from "./chat";
import DocumentIcon from "../icons/document.svg";
import LoadingButtonIcon from "../icons/loading.svg";
import { ServiceProvider } from "../constant";
import { useChatStore } from "../store";
import { showToast } from "./ui-lib";
import { MultimodalContent, MessageRole } from "../client/api";
import { ChatMessage } from "../store/chat";

export function ChatActions(props: Parameters<typeof Actions>[0]) {
  const chatStore = useChatStore();
  const currentProviderName =
    chatStore.currentSession().mask.modelConfig?.providerName;
  const isBedrockProvider = currentProviderName === ServiceProvider.Bedrock;

  async function uploadDocument() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".pdf,.csv,.doc,.docx,.xls,.xlsx,.html,.txt,.md";
    fileInput.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (!file) return;

      props.setUploading(true);
      try {
        // Get file extension and MIME type
        const format = file.name.split(".").pop()?.toLowerCase() || "";
        const supportedFormats = [
          "pdf",
          "csv",
          "doc",
          "docx",
          "xls",
          "xlsx",
          "html",
          "txt",
          "md",
        ];

        if (!supportedFormats.includes(format)) {
          throw new Error("Unsupported file format");
        }

        // Map file extensions to MIME types
        const mimeTypes: { [key: string]: string } = {
          pdf: "application/pdf",
          csv: "text/csv",
          doc: "application/msword",
          docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          xls: "application/vnd.ms-excel",
          xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          html: "text/html",
          txt: "text/plain",
          md: "text/markdown",
        };

        // Convert file to base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (!e.target?.result) return reject("Failed to read file");
            // Get just the base64 data without the data URL prefix
            const base64 = (e.target.result as string).split(",")[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Format file size
        const size = file.size;
        let sizeStr = "";
        if (size < 1024) {
          sizeStr = size + " B";
        } else if (size < 1024 * 1024) {
          sizeStr = (size / 1024).toFixed(2) + " KB";
        } else {
          sizeStr = (size / (1024 * 1024)).toFixed(2) + " MB";
        }

        // Create document content
        const content: MultimodalContent[] = [
          {
            type: "text",
            text: `Document: ${file.name} (${sizeStr})`,
          },
          {
            type: "document",
            document: {
              format,
              name: file.name,
              source: {
                bytes: base64,
                media_type: mimeTypes[format] || `application/${format}`,
              },
            },
          },
        ];

        // Send content to Bedrock
        const session = chatStore.currentSession();
        const modelConfig = session.mask.modelConfig;
        const api = await import("../client/api").then((m) =>
          m.getClientApi(modelConfig.providerName),
        );

        // Create user message
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          role: "user" as MessageRole,
          content,
          date: new Date().toLocaleString(),
          isError: false,
        };

        // Create bot message
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant" as MessageRole,
          content: "",
          date: new Date().toLocaleString(),
          streaming: true,
          isError: false,
        };

        // Add messages to session
        chatStore.updateCurrentSession((session) => {
          session.messages.push(userMessage, botMessage);
        });

        // Make request
        api.llm.chat({
          messages: [userMessage],
          config: { ...modelConfig, stream: true },
          onUpdate(message) {
            botMessage.streaming = true;
            if (message) {
              botMessage.content = message;
            }
            chatStore.updateCurrentSession((session) => {
              session.messages = session.messages.concat();
            });
          },
          onFinish(message) {
            botMessage.streaming = false;
            if (message) {
              botMessage.content = message;
              chatStore.onNewMessage(botMessage);
            }
          },
          onError(error) {
            botMessage.content = error.message;
            botMessage.streaming = false;
            userMessage.isError = true;
            botMessage.isError = true;
            chatStore.updateCurrentSession((session) => {
              session.messages = session.messages.concat();
            });
            console.error("[Chat] failed ", error);
          },
        });
      } catch (error) {
        console.error("Failed to upload document:", error);
        showToast("Failed to upload document");
      } finally {
        props.setUploading(false);
      }
    };
    fileInput.click();
  }

  return (
    <div className="chat-input-actions">
      {/* Original actions */}
      <Actions {...props} />

      {/* Document upload button (only for Bedrock) */}
      {isBedrockProvider && (
        <div className="chat-input-action">
          <div className="icon" onClick={uploadDocument}>
            {props.uploading ? <LoadingButtonIcon /> : <DocumentIcon />}
          </div>
          <div className="text">Upload Document</div>
        </div>
      )}
    </div>
  );
}
