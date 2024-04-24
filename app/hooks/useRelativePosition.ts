import { RefObject, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

export interface Options {
  containerRef?: RefObject<HTMLElement | null>;
  delay?: number;
  offsetDistance?: number;
}

export enum Orientation {
  left,
  right,
  bottom,
  top,
}

export type X = Orientation.left | Orientation.right;
export type Y = Orientation.top | Orientation.bottom;

interface Position {
  id: string;
  poi: {
    targetH: number;
    targetW: number;
    distanceToRightBoundary: number;
    distanceToLeftBoundary: number;
    distanceToTopBoundary: number;
    distanceToBottomBoundary: number;
    overlapPositions: Record<Orientation, boolean>;
    relativePosition: [X, Y];
  };
}

export default function useRelativePosition({
  containerRef = { current: window.document.body },
  delay = 100,
  offsetDistance = 0,
}: Options) {
  const [position, setPosition] = useState<Position | undefined>();

  const getRelativePosition = useDebouncedCallback(
    (target: HTMLDivElement, id: string) => {
      if (!containerRef.current) {
        return;
      }
      const {
        x: targetX,
        y: targetY,
        width: targetW,
        height: targetH,
      } = target.getBoundingClientRect();

      const {
        x: containerX,
        y: containerY,
        width: containerWidth,
        height: containerHeight,
      } = containerRef.current.getBoundingClientRect();

      const distanceToRightBoundary =
        containerX + containerWidth - (targetX + targetW) - offsetDistance;
      const distanceToLeftBoundary = targetX - containerX - offsetDistance;
      const distanceToTopBoundary = targetY - containerY - offsetDistance;
      const distanceToBottomBoundary =
        containerY + containerHeight - (targetY + targetH) - offsetDistance;

      setPosition({
        id,
        poi: {
          targetW: targetW + 2 * offsetDistance,
          targetH: targetH + 2 * offsetDistance,
          distanceToRightBoundary,
          distanceToLeftBoundary,
          distanceToTopBoundary,
          distanceToBottomBoundary,
          overlapPositions: {
            [Orientation.left]: distanceToLeftBoundary <= 0,
            [Orientation.top]: distanceToTopBoundary <= 0,
            [Orientation.right]: distanceToRightBoundary <= 0,
            [Orientation.bottom]: distanceToBottomBoundary <= 0,
          },
          relativePosition: [
            distanceToLeftBoundary <= distanceToRightBoundary
              ? Orientation.left
              : Orientation.right,
            distanceToTopBoundary <= distanceToBottomBoundary
              ? Orientation.top
              : Orientation.bottom,
          ],
        },
      });
    },
    delay,
    {
      leading: true,
      trailing: true,
    },
  );

  return {
    getRelativePosition,
    position,
  };
}
