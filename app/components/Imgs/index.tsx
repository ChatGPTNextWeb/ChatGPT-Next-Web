import { CSSProperties } from "react";
import { getMessageImages } from "@/app/utils";
import { RequestMessage } from "@/app/client/api";

interface ImgsProps {
  message: RequestMessage;
}

export default function Imgs(props: ImgsProps) {
  const { message } = props;
  const imgSrcs = getMessageImages(message);

  if (imgSrcs.length < 1) {
    return <></>;
  }

  const imgVars = {
    "--imgs-width": `calc(var(--max-message-width) - ${
      imgSrcs.length - 1
    }*0.25rem)`,
    "--img-width": `calc(var(--imgs-width)/ ${imgSrcs.length})`,
  };

  return (
    <div
      className={`w-[100%] mt-[0.625rem] flex gap-1`}
      style={imgVars as CSSProperties}
    >
      {imgSrcs.map((image, index) => {
        return (
          <div
            key={index}
            className="flex-1 min-w-[var(--img-width)] pb-[var(--img-width)] object-cover bg-cover bg-no-repeat bg-center box-border rounded-chat-img"
            style={{
              backgroundImage: `url(${image})`,
            }}
          />
        );
      })}
    </div>
  );
}
