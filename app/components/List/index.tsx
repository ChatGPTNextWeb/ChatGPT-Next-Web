import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

interface WidgetStyle {
  selectClassName?: string;
  inputClassName?: string;
  rangeClassName?: string;
  switchClassName?: string;
  inputNextLine?: boolean;
  rangeNextLine?: boolean;
}

interface ChildrenMeta {
  type?: "unknown" | "input" | "range";
}

export interface ListProps {
  className?: string;
  children?: ReactNode;
  id?: string;
  isMobileScreen?: boolean;
  widgetStyle?: WidgetStyle;
}

export interface ListItemProps {
  title: string;
  subTitle?: string;
  children?: JSX.Element | JSX.Element[];
  className?: string;
  onClick?: () => void;
  nextline?: boolean;
}

export const ListContext = createContext<
  { isMobileScreen?: boolean; update?: (m: ChildrenMeta) => void } & WidgetStyle
>({ isMobileScreen: false });

export function ListItem(props: ListItemProps) {
  const {
    className = "",
    onClick,
    title,
    subTitle,
    children,
    nextline,
  } = props;

  const context = useContext(ListContext);

  const [childrenMeta, setMeta] = useState<ChildrenMeta>({});

  const { inputNextLine, rangeNextLine } = context;

  let internalNextLine;

  switch (childrenMeta.type) {
    case "input":
      internalNextLine = !!(nextline || inputNextLine);
      break;
    case "range":
      internalNextLine = !!(nextline || rangeNextLine);
      break;
    default:
      internalNextLine = false;
  }

  const update = useCallback((m: ChildrenMeta) => {
    setMeta(m);
  }, []);

  return (
    <div
      className={`relative after:h-[0.5px] after:bottom-0 after:w-[100%] after:left-0 after:absolute last:after:hidden after:bg-list-item-divider ${
        internalNextLine ? "" : "flex gap-3"
      } justify-between items-center px-0 py-2 md:py-3 ${className}`}
      onClick={onClick}
    >
      <div className={`flex-1 flex flex-col justify-start gap-1`}>
        <div className=" font-common text-sm-mobile font-weight-[500] line-clamp-1">
          {title}
        </div>
        {subTitle && (
          <div className={` text-sm text-text-list-subtitle`}>{subTitle}</div>
        )}
      </div>
      <ListContext.Provider value={{ ...context, update }}>
        <div
          className={`${
            internalNextLine ? "mt-[0.625rem]" : "max-w-[70%]"
          } flex items-center justify-center`}
        >
          {children}
        </div>
      </ListContext.Provider>
    </div>
  );
}

function List(props: ListProps) {
  const { className, children, id, widgetStyle } = props;
  const { isMobileScreen } = useContext(ListContext);
  return (
    <ListContext.Provider value={{ isMobileScreen, ...widgetStyle }}>
      <div className={`flex flex-col w-[100%] ${className}`} id={id}>
        {children}
      </div>
    </ListContext.Provider>
  );
}

List.ListItem = ListItem;
List.ListContext = ListContext;

export default List;
