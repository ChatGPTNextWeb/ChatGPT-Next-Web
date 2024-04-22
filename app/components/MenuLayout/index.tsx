import { useNavigate } from "react-router-dom";
import { Path } from "@/app/constant";
import useDragSideBar from "@/app/hooks/useDragSideBar";
import useMobileScreen from "@/app/hooks/useMobileScreen";
import {
  ComponentType,
  Context,
  createContext,
  useContext,
  useState,
} from "react";

import DragIcon from "@/app/icons/drag.svg";

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

    const isMobileScreen = useMobileScreen();
    // drag side bar
    const { onDragStart } = useDragSideBar();

    let containerClassName = "flex h-[100%] w-[100%]";
    let listClassName =
      "relative basis-sidebar h-[calc(100%-1.25rem)] pb-6 max-md:px-4 max-md:pb-4 rounded-md my-2.5 bg-gray-50";
    let panelClassName = "flex-1 h-[100%] w-page";

    if (isMobileScreen) {
      containerClassName = "h-[100%] w-[100%] relative bg-center";
      listClassName = `h-[100%] w-[100%] flex-1 px-4`;
      panelClassName = `transition-all duration-300 absolute top-0 max-h-[100vh] w-[100%] ${
        showPanel ? "left-0" : "left-[101%]"
      } z-10`;
    }

    return (
      <div className={`${containerClassName}`}>
        <div
          className={`flex flex-col px-6 ${listClassName}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              navigate(Path.Home);
            }
          }}
        >
          <ListComponent
            {...props}
            setShowPanel={setShowPanel}
            showPanel={showPanel}
          />
          {!isMobileScreen && (
            <div
              className={`group absolute right-0 h-[100%] flex items-center`}
              onPointerDown={(e) => onDragStart(e as any)}
            >
              <div className="opacity-0 group-hover:bg-[rgba($color: #000000, $alpha: 0.01) group-hover:opacity-20">
                <DragIcon />
              </div>
            </div>
          )}
        </div>
        <div className={`${panelClassName}`}>
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
