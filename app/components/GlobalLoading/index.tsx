import BotIcon from "@/app/icons/bot.svg";
import LoadingIcon from "@/app/icons/three-dots.svg";

export default function GloablLoading({
  noLogo,
}: {
  noLogo?: boolean;
  useSkeleton?: boolean;
}) {
  return (
    <div
      className={`flex flex-col justify-center items-center w-[100%] h-[100%]`}
    >
      {!noLogo && <BotIcon />}
      <LoadingIcon />
    </div>
  );
}
