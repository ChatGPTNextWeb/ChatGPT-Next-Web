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
  error?: string;
}

export interface ListProps {
  className?: string;
  children?: ReactNode;
  id?: string;
  isMobileScreen?: boolean;
  widgetStyle?: WidgetStyle;
}

type Error =
  | {
      error: true;
      message: string;
    }
  | {
      error: false;
    };

type Validate = (v: any) => Error | Promise<Error>;

export interface ListItemProps {
  title: string;
  subTitle?: string;
  children?: JSX.Element | JSX.Element[];
  className?: string;
  onClick?: () => void;
  nextline?: boolean;
  validator?: Validate | Validate[];
}

export const ListContext = createContext<
  {
    isMobileScreen?: boolean;
    update?: (m: ChildrenMeta) => void;
    handleValidate?: (v: any) => void;
  } & WidgetStyle
>({ isMobileScreen: false });

export function ListItem(props: ListItemProps) {
  const {
    className = "",
    onClick,
    title,
    subTitle,
    children,
    nextline,
    validator,
  } = props;

  const context = useContext(ListContext);

  const [childrenMeta, setMeta] = useState<ChildrenMeta>({});

  const { inputNextLine, rangeNextLine } = context;

  const { type, error } = childrenMeta;

  let internalNextLine;

  switch (type) {
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
    setMeta((pre) => ({ ...pre, ...m }));
  }, []);

  const handleValidate = useCallback((v: any) => {
    let insideValidator;
    if (!validator) {
      insideValidator = () => {};
    } else if (Array.isArray(validator)) {
      insideValidator = (v: any) =>
        Promise.race(validator.map((validate) => validate(v)));
    } else {
      insideValidator = validator;
    }

    Promise.resolve(insideValidator(v)).then((result) => {
      if (result && result.error) {
        return update({
          error: result.message,
        });
      }
      update({
        error: undefined,
      });
    });
  }, []);

  return (
    <div
      className={`relative after:h-[0.5px] after:bottom-0 after:w-[100%] after:left-0 after:absolute last:after:hidden after:bg-list-item-divider ${
        internalNextLine ? "" : "flex gap-3"
      } justify-between items-center px-0 py-2 md:py-3 ${className}`}
      onClick={onClick}
    >
      <div className={`flex-1 flex flex-col justify-start gap-1`}>
        <div className=" font-common text-sm-mobile font-weight-[500] line-clamp-1 text-text-list-title">
          {title}
        </div>
        {subTitle && (
          <div className={` text-sm text-text-list-subtitle`}>{subTitle}</div>
        )}
      </div>
      <ListContext.Provider value={{ ...context, update, handleValidate }}>
        <div
          className={`${
            internalNextLine ? "mt-[0.625rem]" : "max-w-[70%]"
          } flex flex-col items-center justify-center`}
        >
          <div>{children}</div>
          {!!error && (
            <div className="text-text-btn-danger text-sm-mobile-tab mt-[0.3125rem] flex items-start w-[100%]">
              <div className="">{error}</div>
            </div>
          )}
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
