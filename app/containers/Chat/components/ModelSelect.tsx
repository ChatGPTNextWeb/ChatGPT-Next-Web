import Popover from "@/app/components/Popover";
import React, { useMemo, useRef } from "react";
import useRelativePosition, {
  Orientation,
} from "@/app/hooks/useRelativePosition";
import Locale from "@/app/locales";
import { useChatStore } from "@/app/store/chat";
import { useAllModels } from "@/app/utils/hooks";
import { ModelType, useAppConfig } from "@/app/store/config";
import { showToast } from "@/app/components/ui-lib";
import BottomArrow from "@/app/icons/downArrowLgIcon.svg";
import BottomArrowMobile from "@/app/icons/bottomArrow.svg";
import Modal, { TriggerProps } from "@/app/components/Modal";

import Selected from "@/app/icons/selectedIcon.svg";

const ModelSelect = () => {
  const config = useAppConfig();
  const { isMobileScreen } = config;
  const chatStore = useChatStore();
  const currentModel = chatStore.currentSession().mask.modelConfig.model;
  const allModels = useAllModels();
  const models = useMemo(() => {
    const filteredModels = allModels.filter((m) => m.available);
    const defaultModel = filteredModels.find((m) => m.isDefault);

    if (defaultModel) {
      const arr = [
        defaultModel,
        ...filteredModels.filter((m) => m !== defaultModel),
      ];
      return arr;
    } else {
      return filteredModels;
    }
  }, [allModels]);

  const rootRef = useRef<HTMLDivElement>(null);

  const { position, getRelativePosition } = useRelativePosition({
    delay: 0,
  });

  const contentRef = useMemo<{ current: HTMLDivElement | null }>(() => {
    return {
      current: null,
    };
  }, []);
  const selectedItemRef = useRef<HTMLDivElement>(null);

  const autoScrollToSelectedModal = () => {
    window.setTimeout(() => {
      const distanceToParent = selectedItemRef.current?.offsetTop || 0;
      const childHeight = selectedItemRef.current?.offsetHeight || 0;
      const parentHeight = contentRef.current?.offsetHeight || 0;
      const distanceToParentCenter =
        distanceToParent + childHeight / 2 - parentHeight / 2;

      if (distanceToParentCenter > 0 && contentRef.current) {
        contentRef.current.scrollTop = distanceToParentCenter;
      }
    });
  };

  const content: TriggerProps["content"] = ({ close }) => (
    <div
      className={`flex flex-col gap-1 overflow-x-hidden  relative text-sm-title`}
    >
      {models?.map((o) => (
        <div
          key={o.displayName}
          className={`flex  items-center px-3 py-2 gap-3 rounded-action-btn hover:bg-select-option-hovered  cursor-pointer`}
          onClick={() => {
            close();
            chatStore.updateCurrentSession((session) => {
              session.mask.modelConfig.model = o.name as ModelType;
              session.mask.syncGlobalConfig = false;
            });
            showToast(o.name);
          }}
          ref={currentModel === o.name ? selectedItemRef : undefined}
        >
          <div className={`flex-1 text-text-select`}>{o.name}</div>
          <div
            className={currentModel === o.name ? "opacity-100" : "opacity-0"}
          >
            <Selected />
          </div>
        </div>
      ))}
    </div>
  );

  if (isMobileScreen) {
    return (
      <Modal.Trigger
        content={(e) => (
          <div className="h-[100%]  overflow-y-auto" ref={contentRef}>
            {content(e)}
          </div>
        )}
        type="bottom-drawer"
        onOpen={(e) => {
          if (e) {
            autoScrollToSelectedModal();
            getRelativePosition(rootRef.current!, "");
          }
        }}
        title={Locale.Chat.SelectModel}
        headerBordered
        noFooter
        modelClassName="h-model-bottom-drawer"
      >
        <div
          className="flex items-center gap-1 cursor-pointer text-text-modal-select"
          ref={rootRef}
        >
          {currentModel}
          <BottomArrowMobile />
        </div>
      </Modal.Trigger>
    );
  }

  return (
    <Popover
      content={
        <div className="max-h-chat-actions-select-model-popover overflow-y-auto">
          {content({ close: () => {} })}
        </div>
      }
      trigger="click"
      noArrow
      placement={
        position?.poi.relativePosition[1] !== Orientation.bottom ? "lb" : "lt"
      }
      popoverClassName="border border-select-popover rounded-lg shadow-select-popover-shadow w-actions-popover  bg-model-select-popover-panel w-[280px]"
      onShow={(e) => {
        if (e) {
          autoScrollToSelectedModal();
          getRelativePosition(rootRef.current!, "");
        }
      }}
      getPopoverPanelRef={(ref) => (contentRef.current = ref.current)}
    >
      <div
        className="flex items-center justify-center gap-1 cursor-pointer rounded-chat-model-select pl-3 pr-2.5 py-2 font-common leading-4 bg-chat-actions-select-model hover:bg-chat-actions-select-model-hover"
        ref={rootRef}
      >
        <div className="line-clamp-1 max-w-chat-actions-select-model text-sm-title text-text-modal-select">
          {currentModel}
        </div>
        <BottomArrow />
      </div>
    </Popover>
  );
};

export default ModelSelect;
