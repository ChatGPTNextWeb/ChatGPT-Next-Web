import { useState } from "react";
import UserPromptModal from "./UserPromptModal";
import List, { ListItem } from "@/app/components/List";
import Locale from "@/app/locales";
import { useAppConfig } from "@/app/store/config";
import { SearchService, usePromptStore } from "@/app/store/prompt";

import Switch from "@/app/components/Switch";
import Btn from "@/app/components/Btn";

import EditIcon from "@/app/icons/editIcon.svg";

export interface PromptSettingProps {}

export default function PromptSetting(props: PromptSettingProps) {
  const [shouldShowPromptModal, setShowPromptModal] = useState(false);

  const config = useAppConfig();
  const updateConfig = config.update;

  const builtinCount = SearchService.count.builtin;

  const promptStore = usePromptStore();
  const customCount = promptStore.getUserPrompts().length ?? 0;

  const textStyle = " !text-sm";

  return (
    <>
      <List>
        <ListItem
          title={Locale.Settings.Prompt.Disable.Title}
          subTitle={Locale.Settings.Prompt.Disable.SubTitle}
        >
          <Switch
            value={config.disablePromptHint}
            onChange={(e) =>
              updateConfig((config) => (config.disablePromptHint = e))
            }
          />
        </ListItem>

        <ListItem
          title={Locale.Settings.Prompt.List}
          subTitle={Locale.Settings.Prompt.ListCount(builtinCount, customCount)}
        >
          <div className="flex gap-3">
            <Btn
              onClick={() => setShowPromptModal(true)}
              text={
                <span className={textStyle}>{Locale.Settings.Prompt.Edit}</span>
              }
              prefixIcon={config.isMobileScreen ? undefined : <EditIcon />}
            ></Btn>
          </div>
        </ListItem>
      </List>
      {shouldShowPromptModal && (
        <UserPromptModal onClose={() => setShowPromptModal(false)} />
      )}
    </>
  );
}
