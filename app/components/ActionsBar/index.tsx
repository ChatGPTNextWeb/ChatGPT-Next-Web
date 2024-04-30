import { isValidElement } from "react";

type IconMap = {
  active?: JSX.Element;
  inactive?: JSX.Element;
  mobileActive?: JSX.Element;
  mobileInactive?: JSX.Element;
};
interface Action {
  id: string;
  title?: string;
  icons: JSX.Element | IconMap;
  className?: string;
  onClick?: () => void;
  activeClassName?: string;
}

type Groups = {
  normal: string[][];
  mobile: string[][];
};

export interface ActionsBarProps {
  actionsShema: Action[];
  onSelect?: (id: string) => void;
  selected?: string;
  groups: string[][] | Groups;
  className?: string;
  inMobile?: boolean;
}

export default function ActionsBar(props: ActionsBarProps) {
  const { actionsShema, onSelect, selected, groups, className, inMobile } =
    props;

  const handlerClick =
    (action: Action) => (e: { preventDefault: () => void }) => {
      e.preventDefault();
      if (action.onClick) {
        action.onClick();
      }
      if (selected !== action.id) {
        onSelect?.(action.id);
      }
    };

  const internalGroup = Array.isArray(groups)
    ? groups
    : inMobile
    ? groups.mobile
    : groups.normal;

  const content = internalGroup.reduce((res, group, ind, arr) => {
    res.push(
      ...group.map((i) => {
        const action = actionsShema.find((a) => a.id === i);
        if (!action) {
          return <></>;
        }

        const { icons } = action;
        let activeIcon, inactiveIcon, mobileActiveIcon, mobileInactiveIcon;

        if (isValidElement(icons)) {
          activeIcon = icons;
          inactiveIcon = icons;
          mobileActiveIcon = icons;
          mobileInactiveIcon = icons;
        } else {
          activeIcon = (icons as IconMap).active;
          inactiveIcon = (icons as IconMap).inactive;
          mobileActiveIcon = (icons as IconMap).mobileActive;
          mobileInactiveIcon = (icons as IconMap).mobileInactive;
        }

        if (inMobile) {
          return (
            <div
              key={action.id}
              className={` cursor-pointer shrink-1 grow-0 basis-[${
                (100 - 1) / arr.length
              }%] flex flex-col items-center justify-around gap-0.5 py-1.5
                        ${
                          selected === action.id
                            ? "text-text-sidebar-tab-mobile-active"
                            : "text-text-sidebar-tab-mobile-inactive"
                        }
                    `}
              onClick={handlerClick(action)}
            >
              {selected === action.id ? mobileActiveIcon : mobileInactiveIcon}
              <div className="  leading-3 text-sm-mobile-tab h-3 font-common w-[100%]">
                {action.title || " "}
              </div>
            </div>
          );
        }

        return (
          <div
            key={action.id}
            className={`cursor-pointer p-3 ${
              selected === action.id
                ? `!bg-actions-bar-btn-default ${action.activeClassName}`
                : "bg-transparent"
            } rounded-md items-center ${
              action.className
            } transition duration-300 ease-in-out`}
            onClick={handlerClick(action)}
          >
            {selected === action.id ? activeIcon : inactiveIcon}
          </div>
        );
      }),
    );
    if (ind < arr.length - 1) {
      res.push(<div key={String(ind)} className=" flex-1"></div>);
    }
    return res;
  }, [] as JSX.Element[]);

  return <div className={`flex items-center ${className} `}>{content}</div>;
}
