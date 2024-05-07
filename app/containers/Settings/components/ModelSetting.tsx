import { ListItem } from "@/app/components/List";
import {
  ModalConfigValidator,
  ModelConfig,
  useAppConfig,
} from "@/app/store/config";
import { useAllModels } from "@/app/utils/hooks";
import Locale from "@/app/locales";
import Select from "@/app/components/Select";
import SlideRange from "@/app/components/SlideRange";
import Switch from "@/app/components/Switch";
import Input from "@/app/components/Input";

export default function ModelSetting(props: {
  modelConfig: ModelConfig;
  updateConfig: (updater: (config: ModelConfig) => void) => void;
}) {
  const allModels = useAllModels();
  const { isMobileScreen } = useAppConfig();

  return (
    <>
      <ListItem title={Locale.Settings.Model}>
        <Select
          value={props.modelConfig.model}
          options={allModels
            .filter((v) => v.available)
            .map((v) => ({
              value: v.name,
              label: `${v.displayName}(${v.provider?.providerName})`,
            }))}
          onSelect={(e) => {
            props.updateConfig(
              (config) => (config.model = ModalConfigValidator.model(e)),
            );
          }}
        />
      </ListItem>
      <ListItem
        title={Locale.Settings.Temperature.Title}
        subTitle={Locale.Settings.Temperature.SubTitle}
      >
        <SlideRange
          value={props.modelConfig.temperature}
          range={{
            start: 0,
            stroke: 1,
          }}
          step={0.1}
          onSlide={(e) => {
            props.updateConfig(
              (config) =>
                (config.temperature = ModalConfigValidator.temperature(e)),
            );
          }}
        ></SlideRange>
      </ListItem>
      <ListItem
        title={Locale.Settings.TopP.Title}
        subTitle={Locale.Settings.TopP.SubTitle}
      >
        <SlideRange
          value={props.modelConfig.top_p ?? 1}
          range={{
            start: 0,
            stroke: 1,
          }}
          step={0.1}
          onSlide={(e) => {
            props.updateConfig(
              (config) => (config.top_p = ModalConfigValidator.top_p(e)),
            );
          }}
        ></SlideRange>
      </ListItem>
      <ListItem
        title={Locale.Settings.MaxTokens.Title}
        subTitle={Locale.Settings.MaxTokens.SubTitle}
      >
        <Input
          type="number"
          min={1024}
          max={512000}
          value={props.modelConfig.max_tokens}
          onChange={(e) =>
            props.updateConfig(
              (config) =>
                (config.max_tokens = ModalConfigValidator.max_tokens(e)),
            )
          }
        ></Input>
      </ListItem>

      {props.modelConfig.model.startsWith("gemini") ? null : (
        <>
          <ListItem
            title={Locale.Settings.PresencePenalty.Title}
            subTitle={Locale.Settings.PresencePenalty.SubTitle}
          >
            <SlideRange
              value={props.modelConfig.presence_penalty}
              range={{
                start: -2,
                stroke: 4,
              }}
              step={0.1}
              onSlide={(e) => {
                props.updateConfig(
                  (config) =>
                    (config.presence_penalty =
                      ModalConfigValidator.presence_penalty(e)),
                );
              }}
            ></SlideRange>
          </ListItem>

          <ListItem
            title={Locale.Settings.FrequencyPenalty.Title}
            subTitle={Locale.Settings.FrequencyPenalty.SubTitle}
          >
            <SlideRange
              value={props.modelConfig.frequency_penalty}
              range={{
                start: -2,
                stroke: 4,
              }}
              step={0.1}
              onSlide={(e) => {
                props.updateConfig(
                  (config) =>
                    (config.frequency_penalty =
                      ModalConfigValidator.frequency_penalty(e)),
                );
              }}
            ></SlideRange>
          </ListItem>

          <ListItem
            title={Locale.Settings.InjectSystemPrompts.Title}
            subTitle={Locale.Settings.InjectSystemPrompts.SubTitle}
          >
            <Switch
              value={props.modelConfig.enableInjectSystemPrompts}
              onChange={(e) =>
                props.updateConfig(
                  (config) => (config.enableInjectSystemPrompts = e),
                )
              }
            />
          </ListItem>

          <ListItem
            title={Locale.Settings.InputTemplate.Title}
            subTitle={Locale.Settings.InputTemplate.SubTitle}
            nextline={isMobileScreen}
            validator={(v: string) => {
              if (!v.includes("{{input}}")) {
                return {
                  error: true,
                  message: Locale.Settings.InputTemplate.Error,
                };
              }

              return { error: false };
            }}
          >
            <Input
              type="text"
              value={props.modelConfig.template}
              onChange={(e = "") =>
                props.updateConfig((config) => (config.template = e))
              }
            ></Input>
          </ListItem>
        </>
      )}
      <ListItem
        title={Locale.Settings.HistoryCount.Title}
        subTitle={Locale.Settings.HistoryCount.SubTitle}
      >
        <SlideRange
          value={props.modelConfig.historyMessageCount}
          range={{
            start: 0,
            stroke: 64,
          }}
          step={1}
          onSlide={(e) => {
            props.updateConfig((config) => (config.historyMessageCount = e));
          }}
        ></SlideRange>
      </ListItem>

      <ListItem
        title={Locale.Settings.CompressThreshold.Title}
        subTitle={Locale.Settings.CompressThreshold.SubTitle}
      >
        <Input
          type="number"
          min={500}
          max={4000}
          value={props.modelConfig.compressMessageLengthThreshold}
          onChange={(e) =>
            props.updateConfig(
              (config) => (config.compressMessageLengthThreshold = e),
            )
          }
        ></Input>
      </ListItem>
      <ListItem title={Locale.Memory.Title} subTitle={Locale.Memory.Send}>
        <Switch
          value={props.modelConfig.sendMemory}
          onChange={(e) =>
            props.updateConfig((config) => (config.sendMemory = e))
          }
        />
      </ListItem>
    </>
  );
}
