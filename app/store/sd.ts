import { StabilityPath, StoreKey } from "@/app/constant";
import { getHeaders } from "@/app/client/api";
import { createPersistStore } from "@/app/utils/store";
import { nanoid } from "nanoid";
import { uploadImage, base64Image2Blob } from "@/app/utils/chat";
import { models, getModelParamBasicData } from "@/app/components/sd/sd-panel";

const defaultModel = {
  name: models[0].name,
  value: models[0].value,
};

const defaultParams = getModelParamBasicData(models[0].params({}), {});

const DEFAULT_SD_STATE = {
  currentId: 0,
  draw: [],
  currentModel: defaultModel,
  currentParams: defaultParams,
};

export const useSdStore = createPersistStore<
  {
    currentId: number;
    draw: any[];
    currentModel: typeof defaultModel;
    currentParams: any;
  },
  {
    getNextId: () => number;
    sendTask: (data: any, okCall?: Function) => void;
    updateDraw: (draw: any) => void;
    setCurrentModel: (model: any) => void;
    setCurrentParams: (data: any) => void;
  }
>(
  DEFAULT_SD_STATE,
  (set, _get) => {
    function get() {
      return {
        ..._get(),
        ...methods,
      };
    }

    const methods = {
      getNextId() {
        const id = ++_get().currentId;
        set({ currentId: id });
        return id;
      },
      sendTask(data: any, okCall?: Function) {
        data = { ...data, id: nanoid(), status: "running" };
        set({ draw: [data, ..._get().draw] });
        this.getNextId();
        this.stabilityRequestCall(data);
        okCall?.();
      },
      stabilityRequestCall(data: any) {
        const formData = new FormData();
        for (let paramsKey in data.params) {
          formData.append(paramsKey, data.params[paramsKey]);
        }
        const headers = getHeaders();
        delete headers["Content-Type"];
        fetch(`/api/stability/${StabilityPath.GeneratePath}/${data.model}`, {
          method: "POST",
          headers: {
            ...headers,
            Accept: "application/json",
          },
          body: formData,
        })
          .then((response) => response.json())
          .then((resData) => {
            if (resData.errors && resData.errors.length > 0) {
              this.updateDraw({
                ...data,
                status: "error",
                error: resData.errors[0],
              });
              this.getNextId();
              return;
            }
            const self = this;
            if (resData.finish_reason === "SUCCESS") {
              uploadImage(base64Image2Blob(resData.image, "image/png"))
                .then((img_data) => {
                  console.debug("uploadImage success", img_data, self);
                  self.updateDraw({
                    ...data,
                    status: "success",
                    img_data,
                  });
                })
                .catch((e) => {
                  console.error("uploadImage error", e);
                  self.updateDraw({
                    ...data,
                    status: "error",
                    error: JSON.stringify(e),
                  });
                });
            } else {
              self.updateDraw({
                ...data,
                status: "error",
                error: JSON.stringify(resData),
              });
            }
            this.getNextId();
          })
          .catch((error) => {
            this.updateDraw({ ...data, status: "error", error: error.message });
            console.error("Error:", error);
            this.getNextId();
          });
      },
      updateDraw(_draw: any) {
        const draw = _get().draw || [];
        draw.some((item, index) => {
          if (item.id === _draw.id) {
            draw[index] = _draw;
            set(() => ({ draw }));
            return true;
          }
        });
      },
      setCurrentModel(model: any) {
        set({ currentModel: model });
      },
      setCurrentParams(data: any) {
        set({
          currentParams: data,
        });
      },
    };

    return methods;
  },
  {
    name: StoreKey.SdList,
    version: 1.0,
  },
);
