import * as HoverCard from "@radix-ui/react-hover-card";
import { ComponentProps } from "react";

export interface PopoverProps {
  content?: JSX.Element | string;
  children?: JSX.Element;
  arrowClassName?: string;
  popoverClassName?: string;
  noArrow?: boolean;
  align?: ComponentProps<typeof HoverCard.Content>["align"];
  openDelay?: number;
}

export default function HoverPopover(props: PopoverProps) {
  const {
    content,
    children,
    arrowClassName,
    popoverClassName,
    noArrow = false,
    align,
    openDelay = 300,
  } = props;
  return (
    <HoverCard.Root openDelay={openDelay}>
      <HoverCard.Trigger asChild>{children}</HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          className={`${popoverClassName}`}
          sideOffset={5}
          align={align}
        >
          {content}
          {!noArrow && <HoverCard.Arrow className={`${arrowClassName}`} />}
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}
