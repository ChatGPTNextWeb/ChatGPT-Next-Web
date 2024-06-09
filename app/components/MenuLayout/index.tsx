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
import { useAppConfig } from "@/app/store/config";

export interface MenuWrapperInspectProps {
  setExternalProps?: (v: Record<string, any>) => void;
  setShowPanel?: (v: boolean) => void;
  showPanel?: boolean;
  [k: string]: any;
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
    const [externalProps, setExternalProps] = useState({});
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
          w-[100%] relative bg-center
          max-md:h-[100%]
          md:flex md:my-2.5
        `}
      >
        <div
          className={`
            flex flex-col px-6 
            h-[100%] 
            max-md:w-[100%] max-md:px-4 max-md:pb-4 max-md:flex-1
            md:relative md:basis-sidebar  md:pb-6  md:rounded-md md:bg-menu
          `}
        >
          <ListComponent
            {...props}
            setShowPanel={setShowPanel}
            setExternalProps={setExternalProps}
            showPanel={showPanel}
          />
        </div>
        {!isMobileScreen && (
          <div
            className={`group/menu-dragger cursor-col-resize w-[0.25rem]  flex items-center justify-center`}
            onPointerDown={(e) => {
              startDragWidth.current = config.sidebarWidth;
              onDragStart(e as any);
            }}
          >
            <div className="w-[2px] opacity-0 group-hover/menu-dragger:opacity-100 bg-menu-dragger h-[100%] rounded-[2px]">
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
            {...externalProps}
            setShowPanel={setShowPanel}
            setExternalProps={setExternalProps}
            showPanel={showPanel}
          />
        </div>
      </div>
    );
  };
}
