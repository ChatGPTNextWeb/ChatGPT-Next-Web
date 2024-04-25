import { useChatStore } from "@/app/store/chat";
import Locale from "@/app/locales";
import { useAppConfig } from "@/app/store";

export default function ClearContextDivider() {
  const chatStore = useChatStore();
  const { isMobileScreen } = useAppConfig();

  return (
    <div
      className={`mt-6 mb-8 flex items-center justify-center gap-2.5 max-md:cursor-pointer`}
      onClick={() => {
        if (!isMobileScreen) {
          return;
        }
        chatStore.updateCurrentSession(
          (session) => (session.clearContextIndex = undefined),
        );
      }}
    >
      <div className="bg-chat-panel-message-clear-divider h-[1px] w-10"> </div>
      <div className="flex items-center justify-between gap-1 text-sm">
        <div className={`text-text-chat-panel-message-clear`}>
          {Locale.Context.Clear}
        </div>
        <div
          className={`
          text-text-chat-panel-message-clear-revert  underline font-common 
          md:cursor-pointer
          `}
          onClick={() => {
            if (isMobileScreen) {
              return;
            }
            chatStore.updateCurrentSession(
              (session) => (session.clearContextIndex = undefined),
            );
          }}
        >
          {Locale.Context.Revert}
        </div>
      </div>
      <div className="bg-chat-panel-message-clear-divider h-[1px] w-10"> </div>
    </div>
  );
}
