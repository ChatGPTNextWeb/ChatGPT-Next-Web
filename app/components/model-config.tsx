import { ALL_MODELS, ModalConfigValidator, ModelConfig } from "../store";

import Locale from "../locales";
import { InputRange } from "./input-range";
import { ListItem, Modal, Select } from "./ui-lib";
import { useAppConfig, useChatStore } from "../store";
import { IconButton } from "./button";
import DeleteIcon from "../icons/delete.svg";
import DoneIcon from "../icons/done.svg";
import { useMobileScreen } from "../utils";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Path } from "../constant";

function SyncConfigModal(props: {
  onClose: () => void;
  modelConfigKey: keyof ModelConfig;
}) {
  const chatStore = useChatStore();
  const appConfig = useAppConfig();
  const changeConfig = () => {
    chatStore.updateCurrentSession((session) => {
      const sessionConfig = session.mask.modelConfig;
      const globalConfig = appConfig.modelConfig;
      // @ts-ignore
      sessionConfig[props.modelConfigKey] = globalConfig[props.modelConfigKey];
    });
    props.onClose();
  };
  return (
    <div className="modal-mask">
      <Modal
        title={Locale.Context.Edit}
        onClose={() => props.onClose()}
        actions={[
          <IconButton
            key="close"
            icon={<DeleteIcon />}
            bordered
            text={Locale.Settings.Actions.Cancel}
            onClick={props.onClose}
          />,
          <IconButton
            key="confirm"
            icon={<DoneIcon />}
            bordered
            text={Locale.Settings.Actions.Confirm}
            onClick={changeConfig}
          />,
        ]}
      >
        <p>{Locale.Settings.Actions.SyncCurrentSessionConfig}</p>
      </Modal>
    </div>
  );
}

export function ModelConfigList(props: {
  modelConfig: ModelConfig;
  updateConfig: (updater: (config: ModelConfig) => void) => void;
}) {
  const isMobile = useMobileScreen();
  const chatStore = useChatStore();
  const currentSession = chatStore.currentSession();
  const [showModal, setShowModal] = useState(false);
  const [modelConfigKey, setModelConfigKey] =
    useState<keyof ModelConfig>("model");
  const location = useLocation();

  const handleOpenModal = (
    key: keyof ModelConfig,
    sessionModelConfig: ModelConfig[keyof ModelConfig],
    globalModelConfig: ModelConfig[keyof ModelConfig],
  ) => {
    if (location.pathname === Path.Settings) {
      if (sessionModelConfig !== globalModelConfig) {
        setModelConfigKey(key);
        setShowModal(true);
      }
    }
  };

  return (
    <>
      <ListItem title={Locale.Settings.Model}>
        <Select
          value={props.modelConfig.model}
          onChange={(e) => {
            props.updateConfig((config) => {
              config.model = ModalConfigValidator.model(e.currentTarget.value);
              handleOpenModal(
                "model",
                currentSession.mask.modelConfig.model,
                config.model,
              );
            });
          }}
        >
          {ALL_MODELS.map((v) => (
            <option value={v.name} key={v.name} disabled={!v.available}>
              {v.name}
            </option>
          ))}
        </Select>
      </ListItem>
      <ListItem
        title={Locale.Settings.Temperature.Title}
        subTitle={Locale.Settings.Temperature.SubTitle}
      >
        <InputRange
          value={props.modelConfig.temperature?.toFixed(1)}
          min="0"
          max="1" // lets limit it to 0-1
          step="0.1"
          onChange={(e) => {
            props.updateConfig(
              (config) =>
                (config.temperature = ModalConfigValidator.temperature(
                  e.currentTarget.valueAsNumber,
                )),
            );
          }}
          onMouseUp={() => {
            if (!isMobile) {
              handleOpenModal(
                "temperature",
                currentSession.mask.modelConfig.temperature,
                props.modelConfig.temperature,
              );
            }
          }}
          onTouchEnd={() => {
            if (isMobile) {
              handleOpenModal(
                "temperature",
                currentSession.mask.modelConfig.temperature,
                props.modelConfig.temperature,
              );
            }
          }}
        ></InputRange>
      </ListItem>
      <ListItem
        title={Locale.Settings.MaxTokens.Title}
        subTitle={Locale.Settings.MaxTokens.SubTitle}
      >
        <input
          type="number"
          min={100}
          max={32000}
          value={props.modelConfig.max_tokens}
          onChange={(e) =>
            props.updateConfig(
              (config) =>
                (config.max_tokens = ModalConfigValidator.max_tokens(
                  e.currentTarget.valueAsNumber,
                )),
            )
          }
          onBlur={() => {
            handleOpenModal(
              "max_tokens",
              currentSession.mask.modelConfig.max_tokens,
              props.modelConfig.max_tokens,
            );
          }}
        ></input>
      </ListItem>
      <ListItem
        title={Locale.Settings.PresencePenalty.Title}
        subTitle={Locale.Settings.PresencePenalty.SubTitle}
      >
        <InputRange
          value={props.modelConfig.presence_penalty?.toFixed(1)}
          min="-2"
          max="2"
          step="0.1"
          onChange={(e) => {
            props.updateConfig(
              (config) =>
                (config.presence_penalty =
                  ModalConfigValidator.presence_penalty(
                    e.currentTarget.valueAsNumber,
                  )),
            );
          }}
          onMouseUp={() => {
            if (!isMobile) {
              handleOpenModal(
                "presence_penalty",
                currentSession.mask.modelConfig.presence_penalty,
                props.modelConfig.presence_penalty,
              );
            }
          }}
          onTouchEnd={() => {
            if (isMobile) {
              handleOpenModal(
                "presence_penalty",
                currentSession.mask.modelConfig.presence_penalty,
                props.modelConfig.presence_penalty,
              );
            }
          }}
        ></InputRange>
      </ListItem>

      <ListItem
        title={Locale.Settings.FrequencyPenalty.Title}
        subTitle={Locale.Settings.FrequencyPenalty.SubTitle}
      >
        <InputRange
          value={props.modelConfig.frequency_penalty?.toFixed(1)}
          min="-2"
          max="2"
          step="0.1"
          onChange={(e) => {
            props.updateConfig(
              (config) =>
                (config.frequency_penalty =
                  ModalConfigValidator.frequency_penalty(
                    e.currentTarget.valueAsNumber,
                  )),
            );
          }}
          onMouseUp={() => {
            if (!isMobile) {
              handleOpenModal(
                "frequency_penalty",
                currentSession.mask.modelConfig.frequency_penalty,
                props.modelConfig.frequency_penalty,
              );
            }
          }}
          onTouchEnd={() => {
            if (isMobile) {
              handleOpenModal(
                "frequency_penalty",
                currentSession.mask.modelConfig.frequency_penalty,
                props.modelConfig.frequency_penalty,
              );
            }
          }}
        ></InputRange>
      </ListItem>

      <ListItem
        title={Locale.Settings.InputTemplate.Title}
        subTitle={Locale.Settings.InputTemplate.SubTitle}
      >
        <input
          type="text"
          value={props.modelConfig.template}
          onChange={(e) =>
            props.updateConfig(
              (config) => (config.template = e.currentTarget.value),
            )
          }
          onBlur={() =>
            handleOpenModal(
              "template",
              currentSession.mask.modelConfig.template,
              props.modelConfig.template,
            )
          }
        ></input>
      </ListItem>

      <ListItem
        title={Locale.Settings.HistoryCount.Title}
        subTitle={Locale.Settings.HistoryCount.SubTitle}
      >
        <InputRange
          title={props.modelConfig.historyMessageCount.toString()}
          value={props.modelConfig.historyMessageCount}
          min="0"
          max="32"
          step="1"
          onChange={(e) =>
            props.updateConfig(
              (config) => (config.historyMessageCount = e.target.valueAsNumber),
            )
          }
          onMouseUp={() => {
            if (!isMobile) {
              handleOpenModal(
                "historyMessageCount",
                currentSession.mask.modelConfig.historyMessageCount,
                props.modelConfig.historyMessageCount,
              );
            }
          }}
          onTouchEnd={() => {
            if (isMobile) {
              handleOpenModal(
                "historyMessageCount",
                currentSession.mask.modelConfig.historyMessageCount,
                props.modelConfig.historyMessageCount,
              );
            }
          }}
        ></InputRange>
      </ListItem>

      <ListItem
        title={Locale.Settings.CompressThreshold.Title}
        subTitle={Locale.Settings.CompressThreshold.SubTitle}
      >
        <input
          type="number"
          min={500}
          max={4000}
          value={props.modelConfig.compressMessageLengthThreshold}
          onChange={(e) =>
            props.updateConfig(
              (config) =>
                (config.compressMessageLengthThreshold =
                  e.currentTarget.valueAsNumber),
            )
          }
          onBlur={() => {
            handleOpenModal(
              "compressMessageLengthThreshold",
              currentSession.mask.modelConfig.compressMessageLengthThreshold,
              props.modelConfig.compressMessageLengthThreshold,
            );
          }}
        ></input>
      </ListItem>
      <ListItem title={Locale.Memory.Title} subTitle={Locale.Memory.Send}>
        <input
          type="checkbox"
          checked={props.modelConfig.sendMemory}
          onChange={(e) =>
            props.updateConfig((config) => {
              config.sendMemory = e.currentTarget.checked;
              handleOpenModal(
                "sendMemory",
                currentSession.mask.modelConfig.sendMemory,
                config.sendMemory,
              );
            })
          }
        ></input>
      </ListItem>
      {showModal && (
        <SyncConfigModal
          onClose={() => setShowModal(false)}
          modelConfigKey={modelConfigKey}
        />
      )}
    </>
  );
}
