import { IconButton } from "@/app/components/button";
import GithubIcon from "@/app/icons/github.svg";
import SDIcon from "@/app/icons/sd.svg";
import ReturnIcon from "@/app/icons/return.svg";
import Locale from "@/app/locales";

import { Path, REPO_URL } from "@/app/constant";

import { useNavigate } from "react-router-dom";
import dynamic from "next/dynamic";
import {
  SideBarContainer,
  SideBarBody,
  SideBarHeader,
  SideBarTail,
  useDragSideBar,
  useHotKey,
} from "@/app/components/sidebar";

const SdPanel = dynamic(
  async () => (await import("@/app/components/sd")).SdPanel,
  {
    loading: () => null,
  },
);

export function SideBar(props: { className?: string }) {
  useHotKey();
  const { onDragStart, shouldNarrow } = useDragSideBar();
  const navigate = useNavigate();

  return (
    <SideBarContainer
      onDragStart={onDragStart}
      shouldNarrow={shouldNarrow}
      {...props}
    >
      <SideBarHeader
        title={
          <IconButton
            icon={<ReturnIcon />}
            bordered
            title={Locale.Sd.Actions.ReturnHome}
            onClick={() => navigate(Path.Home)}
          />
        }
        logo={<SDIcon width={38} height={38} />}
      ></SideBarHeader>
      <SideBarBody>
        <SdPanel />
      </SideBarBody>
      <SideBarTail
        primaryAction={
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
            <IconButton icon={<GithubIcon />} shadow />
          </a>
        }
      />
    </SideBarContainer>
  );
}
