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
}

type Groups = {
  normal: string[][];
  mobile: string[][];
};

export interface TabActionsProps {
  actionsShema: Action[];
  onSelect: (id: string) => void;
  selected: string;
  groups: string[][] | Groups;
  className?: string;
  inMobile: boolean;
}

export default function TabActions(props: TabActionsProps) {
  const { actionsShema, onSelect, selected, groups, className, inMobile } =
    props;

  const handlerClick = (id: string) => (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (selected !== id) {
      onSelect?.(id);
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
              className={` shrink-1 grow-0 basis-[${
                (100 - 1) / arr.length
              }%] flex flex-col items-center justify-center gap-0.5
                        ${
                          selected === action.id
                            ? "text-blue-700"
                            : "text-gray-400"
                        }
                    `}
              onClick={handlerClick(action.id)}
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
            className={` ${
              selected === action.id ? "bg-blue-900" : "bg-transparent"
            } p-3 rounded-md items-center ${action.className}`}
            onClick={handlerClick(action.id)}
          >
            {selected === action.id ? activeIcon : inactiveIcon}
          </div>
        );
      }),
    );
    if (ind < arr.length - 1) {
      res.push(<div className=" flex-1"></div>);
    }
    return res;
  }, [] as JSX.Element[]);

  return (
    <div
      className={`flex ${
        inMobile ? "justify-around" : "flex-col"
      } items-center ${className}`}
    >
      {content}
    </div>
  );
}
