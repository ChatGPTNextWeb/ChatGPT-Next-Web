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

export default function SyncItems() {
  const syncStore = useSyncStore();
  const chatStore = useChatStore();
  const promptStore = usePromptStore();
  const maskStore = useMaskStore();
  const couldSync = useMemo(() => {
    return syncStore.cloudSync();
  }, [syncStore]);

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

  const btnStyle = " !shadow-none !bg-gray-50";
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
              className={btnStyle}
              onClick={() => {
                setShowSyncConfigModal(true);
              }}
              text={<span className={textStyle}>{Locale.UI.Config}</span>}
            ></Btn>
            {couldSync && (
              <Btn
                className={btnStyle}
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
              className={btnStyle}
              onClick={() => {
                syncStore.export();
              }}
              text={<span className={textStyle}>{Locale.UI.Export}</span>}
            ></Btn>
            <Btn
              className={btnStyle}
              onClick={async () => {
                syncStore.import();
              }}
              text={<span className={textStyle}>{Locale.UI.Import}</span>}
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
