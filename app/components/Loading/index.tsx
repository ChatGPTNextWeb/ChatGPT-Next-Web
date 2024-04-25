import useMobileScreen from "@/app/hooks/useMobileScreen";
import BotIcon from "@/app/icons/bot.svg";
import LoadingIcon from "@/app/icons/three-dots.svg";

import { getCSSVar } from "@/app/utils";

export default function Loading({
  noLogo,
  useSkeleton = true,
}: {
  noLogo?: boolean;
  useSkeleton?: boolean;
}) {
  let theme;
  if (typeof window !== "undefined") {
    theme = getCSSVar("--default-container-bg");
  }

  const isMobileScreen = useMobileScreen();

  return (
    <div
      className={`flex flex-col justify-center items-center w-[100%] ${
        isMobileScreen
          ? "h-[100%]"
          : `my-2.5 ml-1 mr-2.5 rounded-md h-[calc(100%-1.25rem)]`
      }`}
      style={{ background: useSkeleton ? theme : "" }}
    >
      {!noLogo && <BotIcon />}
      <LoadingIcon />
    </div>
  );
}
