import styles from "./sd-panel.module.scss";
import React, { useState } from "react";
import { Select } from "@/app/components/ui-lib";
import { IconButton } from "@/app/components/button";
import locales from "@/app/locales";

const sdCommonParams = (model: string, data: any) => {
  return [
    {
      name: locales.SdPanel.Prompt,
      value: "prompt",
      type: "textarea",
      placeholder: locales.SdPanel.PleaseInput(locales.SdPanel.Prompt),
      required: true,
    },
    {
      name: locales.SdPanel.ModelVersion,
      value: "model",
      type: "select",
      default: 0,
      support: ["sd3"],
      options: [
        { name: "SD3 Medium", value: "sd3-medium" },
        { name: "SD3 Large", value: "sd3-large" },
        { name: "SD3 Large Turbo", value: "sd3-large-turbo" },
      ],
    },
    {
      name: locales.SdPanel.NegativePrompt,
      value: "negative_prompt",
      type: "textarea",
      placeholder: locales.SdPanel.PleaseInput(locales.SdPanel.NegativePrompt),
    },
    {
      name: locales.SdPanel.AspectRatio,
      value: "aspect_ratio",
      type: "select",
      default: "1:1",
      options: [
        { name: "1:1", value: "1:1" },
        { name: "16:9", value: "16:9" },
        { name: "21:9", value: "21:9" },
        { name: "2:3", value: "2:3" },
        { name: "3:2", value: "3:2" },
        { name: "4:5", value: "4:5" },
        { name: "5:4", value: "5:4" },
        { name: "9:16", value: "9:16" },
        { name: "9:21", value: "9:21" },
      ],
    },
    {
      name: locales.SdPanel.ImageStyle,
      value: "style",
      type: "select",
      default: "3d",
      support: ["core"],
      options: [
        { name: locales.SdPanel.Styles.D3Model, value: "3d-model" },
        { name: locales.SdPanel.Styles.AnalogFilm, value: "analog-film" },
        { name: locales.SdPanel.Styles.Anime, value: "anime" },
        { name: locales.SdPanel.Styles.Cinematic, value: "cinematic" },
        { name: locales.SdPanel.Styles.ComicBook, value: "comic-book" },
        { name: locales.SdPanel.Styles.DigitalArt, value: "digital-art" },
        { name: locales.SdPanel.Styles.Enhance, value: "enhance" },
        { name: locales.SdPanel.Styles.FantasyArt, value: "fantasy-art" },
        { name: locales.SdPanel.Styles.Isometric, value: "isometric" },
        { name: locales.SdPanel.Styles.LineArt, value: "line-art" },
        { name: locales.SdPanel.Styles.LowPoly, value: "low-poly" },
        {
          name: locales.SdPanel.Styles.ModelingCompound,
          value: "modeling-compound",
        },
        { name: locales.SdPanel.Styles.NeonPunk, value: "neon-punk" },
        { name: locales.SdPanel.Styles.Origami, value: "origami" },
        { name: locales.SdPanel.Styles.Photographic, value: "photographic" },
        { name: locales.SdPanel.Styles.PixelArt, value: "pixel-art" },
        { name: locales.SdPanel.Styles.TileTexture, value: "tile-texture" },
      ],
    },
    {
      name: "Seed",
      value: "seed",
      type: "number",
      default: 0,
      min: 0,
      max: 4294967294,
    },
    {
      name: locales.SdPanel.OutFormat,
      value: "output_format",
      type: "select",
      default: 0,
      options: [
        { name: "PNG", value: "png" },
        { name: "JPEG", value: "jpeg" },
        { name: "WebP", value: "webp" },
      ],
    },
  ].filter((item) => {
    return !(item.support && !item.support.includes(model));
  });
};

const models = [
  {
    name: "Stable Image Ultra",
    value: "ultra",
    params: (data: any) => sdCommonParams("ultra", data),
  },
  {
    name: "Stable Image Core",
    value: "core",
    params: (data: any) => sdCommonParams("core", data),
  },
  {
    name: "Stable Diffusion 3",
    value: "sd3",
    params: (data: any) => {
      return sdCommonParams("sd3", data).filter((item) => {
        return !(
          data.model === "sd3-large-turbo" && item.value == "negative_prompt"
        );
      });
    },
  },
];

export function ControlParamItem(props: {
  title: string;
  subTitle?: string;
  children?: JSX.Element | JSX.Element[];
  className?: string;
}) {
  return (
    <div className={styles["ctrl-param-item"] + ` ${props.className || ""}`}>
      <div className={styles["ctrl-param-item-header"]}>
        <div className={styles["ctrl-param-item-title"]}>
          <div>{props.title}</div>
        </div>
      </div>
      {props.children}
      {props.subTitle && (
        <div className={styles["ctrl-param-item-sub-title"]}>
          {props.subTitle}
        </div>
      )}
    </div>
  );
}

export function ControlParam(props: {
  columns: any[];
  data: any;
  onChange: (field: string, val: any) => void;
}) {
  return (
    <>
      {props.columns.map((item) => {
        let element: null | JSX.Element;
        switch (item.type) {
          case "textarea":
            element = (
              <ControlParamItem title={item.name} subTitle={item.sub}>
                <textarea
                  rows={item.rows || 3}
                  style={{ maxWidth: "100%", width: "100%", padding: "10px" }}
                  placeholder={item.placeholder}
                  onChange={(e) => {
                    props.onChange(item.value, e.currentTarget.value);
                  }}
                  value={props.data[item.value]}
                ></textarea>
              </ControlParamItem>
            );
            break;
          case "select":
            element = (
              <ControlParamItem title={item.name} subTitle={item.sub}>
                <Select
                  value={props.data[item.value]}
                  onChange={(e) => {
                    props.onChange(item.value, e.currentTarget.value);
                  }}
                >
                  {item.options.map((opt: any) => {
                    return (
                      <option value={opt.value} key={opt.value}>
                        {opt.name}
                      </option>
                    );
                  })}
                </Select>
              </ControlParamItem>
            );
            break;
          case "number":
            element = (
              <ControlParamItem title={item.name} subTitle={item.sub}>
                <input
                  type="number"
                  min={item.min}
                  max={item.max}
                  value={props.data[item.value] || 0}
                  onChange={(e) => {
                    props.onChange(item.value, parseInt(e.currentTarget.value));
                  }}
                />
              </ControlParamItem>
            );
            break;
          default:
            element = (
              <ControlParamItem title={item.name} subTitle={item.sub}>
                <input
                  type="text"
                  value={props.data[item.value]}
                  style={{ maxWidth: "100%", width: "100%" }}
                  onChange={(e) => {
                    props.onChange(item.value, e.currentTarget.value);
                  }}
                />
              </ControlParamItem>
            );
        }
        return <div key={item.value}>{element}</div>;
      })}
    </>
  );
}

const getModelParamBasicData = (
  columns: any[],
  data: any,
  clearText?: boolean,
) => {
  const newParams: any = {};
  columns.forEach((item: any) => {
    if (clearText && ["text", "textarea", "number"].includes(item.type)) {
      newParams[item.value] = item.default || "";
    } else {
      // @ts-ignore
      newParams[item.value] = data[item.value] || item.default || "";
    }
  });
  return newParams;
};

export function SdPanel() {
  const [currentModel, setCurrentModel] = useState(models[0]);
  const [params, setParams] = useState(
    getModelParamBasicData(currentModel.params({}), {}),
  );
  const handleValueChange = (field: string, val: any) => {
    setParams((prevParams: any) => ({
      ...prevParams,
      [field]: val,
    }));
  };
  const handleModelChange = (model: any) => {
    setCurrentModel(model);
    setParams(getModelParamBasicData(model.params({}), params));
  };
  const handleSubmit = () => {
    const columns = currentModel.params(params);
    const reqData: any = {};
    columns.forEach((item: any) => {
      reqData[item.value] = params[item.value] ?? null;
    });
    console.log(JSON.stringify(reqData, null, 4));
    setParams(getModelParamBasicData(columns, params, true));
  };
  return (
    <>
      <ControlParamItem title={locales.SdPanel.AIModel}>
        <div className={styles["ai-models"]}>
          {models.map((item) => {
            return (
              <IconButton
                text={item.name}
                key={item.value}
                type={currentModel.value == item.value ? "primary" : null}
                shadow
                onClick={() => handleModelChange(item)}
              />
            );
          })}
        </div>
      </ControlParamItem>
      <ControlParam
        columns={currentModel.params(params) as any[]}
        data={params}
        onChange={handleValueChange}
      ></ControlParam>
      <IconButton
        text={locales.SdPanel.Submit}
        type="primary"
        style={{ marginTop: "20px" }}
        shadow
        onClick={handleSubmit}
      ></IconButton>
    </>
  );
}
