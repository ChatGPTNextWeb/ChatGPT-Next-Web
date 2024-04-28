import { useNavigate } from "react-router-dom";
import {
  DEFAULT_SIDEBAR_WIDTH,
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  Path,
} from "@/app/constant";
import useDrag from "@/app/hooks/useDrag";
import useMobileScreen from "@/app/hooks/useMobileScreen";
import { updateGlobalCSSVars } from "@/app/utils/client";
import { ComponentType, useRef, useState } from "react";

import DragIcon from "@/app/icons/drag.svg";
import { useAppConfig } from "@/app/store/config";

export interface MenuWrapperInspectProps {
  setShowPanel?: (v: boolean) => void;
  showPanel?: boolean;
}

export default function MenuLayout<
  ListComponentProps extends MenuWrapperInspectProps,
  PanelComponentProps extends MenuWrapperInspectProps,
>(
  ListComponent: ComponentType<ListComponentProps>,
  PanelComponent: ComponentType<PanelComponentProps>,
) {
  return function MenuHood(props: ListComponentProps & PanelComponentProps) {
    const [showPanel, setShowPanel] = useState(false);

    const navigate = useNavigate();
    const config = useAppConfig();

    const isMobileScreen = useMobileScreen();

    const startDragWidth = useRef(config.sidebarWidth ?? DEFAULT_SIDEBAR_WIDTH);
    // drag side bar
    const { onDragStart } = useDrag({
      customToggle: () => {
        config.update((config) => {
          config.sidebarWidth = DEFAULT_SIDEBAR_WIDTH;
        });
      },
      customDragMove: (nextWidth: number) => {
        const { menuWidth } = updateGlobalCSSVars(nextWidth);

        document.documentElement.style.setProperty(
          "--menu-width",
          `${menuWidth}px`,
        );
        config.update((config) => {
          config.sidebarWidth = nextWidth;
        });
      },
      customLimit: (x: number) =>
        Math.max(
          MIN_SIDEBAR_WIDTH,
          Math.min(MAX_SIDEBAR_WIDTH, startDragWidth.current + x),
        ),
    });

    return (
      <div
        className={`
        h-[100%] w-[100%] relative bg-center
        md:flex 
      `}
      >
        <div
          className={`
            flex flex-col px-6 
            h-[100%] 
            max-md:w-[100%] max-md:px-4 max-md:pb-4 max-md:flex-1
            md:relative md:basis-sidebar md:h-[calc(100%-1.25rem)] md:pb-6  md:rounded-md md:my-2.5 md:bg-menu
          `}
          // onClick={(e) => {
          //   if (e.target === e.currentTarget) {
          //     navigate(Path.Home);
          //   }
          // }}
        >
          <ListComponent
            {...props}
            setShowPanel={setShowPanel}
            showPanel={showPanel}
          />
        </div>
        {!isMobileScreen && (
          <div
            className={`group/menu-dragger h-[100%] cursor-col-resize w-[0.25rem]  flex items-center justify-center`}
            onPointerDown={(e) => {
              startDragWidth.current = config.sidebarWidth;
              onDragStart(e as any);
            }}
          >
            <div className="w-[1px] opacity-0 group-hover/menu-dragger:opacity-100 bg-menu-dragger">
              &nbsp;
            </div>
          </div>
        )}
        <div
          className={`
          md:flex-1 md:h-[100%] md:w-page
          max-md:transition-all max-md:duration-300 max-md:absolute max-md:top-0 max-md:max-h-[100vh] max-md:w-[100%] ${
            showPanel ? "max-md:left-0" : "max-md:left-[101%]"
          } max-md:z-10
        `}
        >
          <PanelComponent
            {...props}
            setShowPanel={setShowPanel}
            showPanel={showPanel}
          />
        </div>
      </div>
    );
  };
}
