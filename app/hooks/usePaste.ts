import { isVisionModel } from "@/app/utils";
import { compressImage } from "@/app/utils/chat";
import { useCallback, useRef } from "react";
import { useChatStore } from "../store/chat";

interface UseUploadImageOptions {
  setUploading?: (v: boolean) => void;
  emitImages?: (imgs: string[]) => void;
}

export default function usePaste(
  attachImages: string[],
  options: UseUploadImageOptions,
) {
  const chatStore = useChatStore();

  const attachImagesRef = useRef<string[]>([]);
  const optionsRef = useRef<UseUploadImageOptions>({});
  const chatStoreRef = useRef<typeof chatStore | undefined>();

  attachImagesRef.current = attachImages;
  optionsRef.current = options;
  chatStoreRef.current = chatStore;

  const handlePaste = useCallback(
    async (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const { setUploading, emitImages } = optionsRef.current;
      const currentModel =
        chatStoreRef.current?.currentSession().mask.modelConfig.model;
      if (currentModel && !isVisionModel(currentModel)) {
        return;
      }
      const items = (event.clipboardData || window.clipboardData).items;
      for (const item of items) {
        if (item.kind === "file" && item.type.startsWith("image/")) {
          event.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const images: string[] = [];
            images.push(...attachImages);
            images.push(
              ...(await new Promise<string[]>((res, rej) => {
                setUploading?.(true);
                const imagesData: string[] = [];
                compressImage(file, 256 * 1024)
                  .then((dataUrl) => {
                    imagesData.push(dataUrl);
                    setUploading?.(false);
                    res(imagesData);
                  })
                  .catch((e) => {
                    setUploading?.(false);
                    rej(e);
                  });
              })),
            );
            const imagesLength = images.length;

            if (imagesLength > 3) {
              images.splice(3, imagesLength - 3);
            }
            emitImages?.(images);
          }
        }
      }
    },
    [],
  );

  return {
    handlePaste,
  };
}
