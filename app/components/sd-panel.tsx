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
        { name: "2:2", value: "2:2" },
      ],
    },
    {
      name: locales.SdPanel.ImageStyle,
      value: "style",
      type: "select",
      default: "3d",
      support: ["core"],
      options: [{ name: "3D", value: "3d" }],
    },
    { name: "Seed", value: "seed", type: "number", default: 0 },
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
      return sdCommonParams("sd3", data);
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
  set: React.Dispatch<React.SetStateAction<{}>>;
}) {
  const handleValueChange = (field: string, val: any) => {
    props.set((prevParams) => ({
      ...prevParams,
      [field]: val,
    }));
  };

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
                    handleValueChange(item.value, e.currentTarget.value);
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
                    handleValueChange(item.value, e.currentTarget.value);
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
                  value={props.data[item.value]}
                  onChange={(e) => {
                    handleValueChange(item.value, e.currentTarget.value);
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
                    handleValueChange(item.value, e.currentTarget.value);
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

export function SdPanel() {
  const [currentModel, setCurrentModel] = useState(models[0]);
  const [params, setParams] = useState({});
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
                onClick={() => {
                  setCurrentModel(item);
                }}
              />
            );
          })}
        </div>
      </ControlParamItem>
      <ControlParam
        columns={currentModel.params(params) as any[]}
        set={setParams}
        data={params}
      ></ControlParam>
      <IconButton
        text={locales.SdPanel.Submit}
        type="primary"
        style={{ marginTop: "20px" }}
        shadow
      ></IconButton>
    </>
  );
}
