import { Path } from "@/app/constant";
import { ComponentType } from "react";
import { useNavigate } from "react-router-dom";

export interface MenuWrapperProps {
  show: boolean;
  wrapperClassName?: string;
}

export default function MenuWrapper<ComponentProps>(
  Component: ComponentType<ComponentProps>,
) {
  return function MenuHood(props: MenuWrapperProps & ComponentProps) {
    const { show, wrapperClassName } = props;

    const navigate = useNavigate();

    if (!show) {
      return null;
    }

    return (
      <div
        className={`flex flex-col px-6 pb-6 ${wrapperClassName}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            navigate(Path.Home);
          }
        }}
      >
        <Component {...props} />
      </div>
    );
  };
}
