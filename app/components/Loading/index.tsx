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

  return (
    <div
      className={`
        flex flex-col justify-center items-center w-[100%] 
        h-[100%]
        md:my-2.5
        md:ml-1
        md:mr-2.5
        md:rounded-md
        md:h-[calc(100%-1.25rem)]
        `}
      style={{ background: useSkeleton ? theme : "" }}
    >
      {!noLogo && <BotIcon />}
      <LoadingIcon />
    </div>
  );
}
