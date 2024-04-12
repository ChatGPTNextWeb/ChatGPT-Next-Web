import { isValidElement } from "react";

type IconMap = {
  active: JSX.Element;
  inactive: JSX.Element;
};
interface Action {
  id: string;
  icons: JSX.Element | IconMap;
  className?: string;
}

export interface TabActionsProps {
  actionsShema: Action[];
  onSelect: (id: string) => void;
  selected: string;
  groups: string[][];
  className?: string;
}

export default function TabActions(props: TabActionsProps) {
  const { actionsShema, onSelect, selected, groups, className } = props;

  const content = groups.reduce((res, group, ind, arr) => {
    res.push(
      ...group.map((i) => {
        const action = actionsShema.find((a) => a.id === i);
        if (!action) {
          return <></>;
        }

        const { icons } = action;
        let activeIcon, inactiveIcon;

        if (isValidElement(icons)) {
          activeIcon = icons;
          inactiveIcon = icons;
        } else {
          activeIcon = (icons as IconMap).active;
          inactiveIcon = (icons as IconMap).inactive;
        }

        return (
          <div
            key={action.id}
            className={` ${
              selected === action.id ? "bg-blue-900" : "bg-transparent"
            } p-3 rounded-md items-center ${action.className}`}
            onClick={(e) => {
              e.preventDefault();
              if (selected !== action.id) {
                onSelect?.(action.id);
              }
            }}
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
    <div className={`flex flex-col items-center ${className}`}>{content}</div>
  );
}
