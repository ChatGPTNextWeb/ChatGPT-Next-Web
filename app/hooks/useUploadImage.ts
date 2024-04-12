import { compressImage } from "@/app/utils";
import { useCallback, useRef } from "react";

interface UseUploadImageOptions {
  setUploading?: (v: boolean) => void;
  emitImages?: (imgs: string[]) => void;
}

export default function useUploadImage(
  attachImages: string[],
  options: UseUploadImageOptions,
) {
  const attachImagesRef = useRef<string[]>([]);
  const optionsRef = useRef<UseUploadImageOptions>({});

  attachImagesRef.current = attachImages;
  optionsRef.current = options;

  const uploadImage = useCallback(async function uploadImage() {
    const images: string[] = [];
    images.push(...attachImagesRef.current);

    const { setUploading, emitImages } = optionsRef.current;

    images.push(
      ...(await new Promise<string[]>((res, rej) => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept =
          "image/png, image/jpeg, image/webp, image/heic, image/heif";
        fileInput.multiple = true;
        fileInput.onchange = (event: any) => {
          setUploading?.(true);
          const files = event.target.files;
          const imagesData: string[] = [];
          for (let i = 0; i < files.length; i++) {
            const file = event.target.files[i];
            compressImage(file, 256 * 1024)
              .then((dataUrl) => {
                imagesData.push(dataUrl);
                if (
                  imagesData.length === 3 ||
                  imagesData.length === files.length
                ) {
                  setUploading?.(false);
                  res(imagesData);
                }
              })
              .catch((e) => {
                setUploading?.(false);
                rej(e);
              });
          }
        };
        fileInput.click();
      })),
    );

    const imagesLength = images.length;
    if (imagesLength > 3) {
      images.splice(3, imagesLength - 3);
    }
    emitImages?.(images);
  }, []);

  return {
    uploadImage,
  };
}
