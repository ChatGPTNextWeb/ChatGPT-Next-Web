import ConfigIcon from "@/app/icons/configIcon2.svg";
import ExportIcon from "@/app/icons/exportIcon.svg";
import ImportIcon from "@/app/icons/importIcon.svg";
import SyncIcon from "@/app/icons/syncIcon.svg";

import { showToast } from "@/app/components/ui-lib";
import { useChatStore } from "@/app/store/chat";
import { useMaskStore } from "@/app/store/mask";
import { usePromptStore } from "@/app/store/prompt";
import { useSyncStore } from "@/app/store/sync";
import { useMemo, useState } from "react";
import Locale from "@/app/locales";

import SyncConfigModal from "./SyncConfigModal";
import List, { ListItem } from "@/app/components/List";
import Btn from "@/app/components/Btn";
import { useAppConfig } from "@/app/store";

export default function SyncItems() {
  const syncStore = useSyncStore();
  const chatStore = useChatStore();
  const promptStore = usePromptStore();
  const maskStore = useMaskStore();
  const couldSync = useMemo(() => {
    return syncStore.cloudSync();
  }, [syncStore]);

  const { isMobileScreen } = useAppConfig();

  const [showSyncConfigModal, setShowSyncConfigModal] = useState(false);

  const stateOverview = useMemo(() => {
    const sessions = chatStore.sessions;
    const messageCount = sessions.reduce((p, c) => p + c.messages.length, 0);

    return {
      chat: sessions.length,
      message: messageCount,
      prompt: Object.keys(promptStore.prompts).length,
      mask: Object.keys(maskStore.masks).length,
    };
  }, [chatStore.sessions, maskStore.masks, promptStore.prompts]);

  const textStyle = "!text-sm";
  return (
    <>
      <List>
        <ListItem
          title={Locale.Settings.Sync.CloudState}
          subTitle={
            syncStore.lastProvider
              ? `${new Date(syncStore.lastSyncTime).toLocaleString()} [${
                  syncStore.lastProvider
                }]`
              : Locale.Settings.Sync.NotSyncYet
          }
        >
          <div className="flex gap-3">
            <Btn
              onClick={() => {
                setShowSyncConfigModal(true);
              }}
              text={<span className={textStyle}>{Locale.UI.Config}</span>}
              prefixIcon={isMobileScreen ? undefined : <ConfigIcon />}
            ></Btn>
            {couldSync && (
              <Btn
                onClick={async () => {
                  try {
                    await syncStore.sync();
                    showToast(Locale.Settings.Sync.Success);
                  } catch (e) {
                    showToast(Locale.Settings.Sync.Fail);
                    console.error("[Sync]", e);
                  }
                }}
                text={<span className={textStyle}>{Locale.UI.Sync}</span>}
                prefixIcon={<SyncIcon />}
              ></Btn>
            )}
          </div>
        </ListItem>

        <ListItem
          title={Locale.Settings.Sync.LocalState}
          subTitle={Locale.Settings.Sync.Overview(stateOverview)}
        >
          <div className="flex gap-3">
            <Btn
              onClick={() => {
                syncStore.export();
              }}
              text={<span className={textStyle}>{Locale.UI.Export}</span>}
              prefixIcon={<ExportIcon />}
            ></Btn>
            <Btn
              onClick={async () => {
                syncStore.import();
              }}
              text={<span className={textStyle}>{Locale.UI.Import}</span>}
              prefixIcon={<ImportIcon />}
            ></Btn>
          </div>
        </ListItem>
      </List>

      {showSyncConfigModal && (
        <SyncConfigModal onClose={() => setShowSyncConfigModal(false)} />
      )}
    </>
  );
}
