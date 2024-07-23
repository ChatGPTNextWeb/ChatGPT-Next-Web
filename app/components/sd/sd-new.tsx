import homeStyles from "@/app/components/home.module.scss";

import { IconButton } from "@/app/components/button";
import GithubIcon from "@/app/icons/github.svg";
import ReturnIcon from "@/app/icons/return.svg";
import Locale from "@/app/locales";
import HistoryIcon from "@/app/icons/history.svg";

import { Path, REPO_URL } from "@/app/constant";

import { useNavigate } from "react-router-dom";
import dynamic from "next/dynamic";
import {
  SideBarContainer,
  SideBarBody,
  SideBarTail,
  useDragSideBar,
  useHotKey,
} from "@/app/components/sidebar";
import { getParams, getModelParamBasicData } from "./sd-panel";
import { useSdStore } from "@/app/store/sd";
import { showToast } from "@/app/components/ui-lib";

const SdPanel = dynamic(
  async () => (await import("@/app/components/sd")).SdPanel,
  {
    loading: () => null,
  },
);

export function SdNew() {
  useHotKey();
  const { onDragStart, shouldNarrow } = useDragSideBar();
  const navigate = useNavigate();
  const sdStore = useSdStore();
  const currentModel = sdStore.currentModel;
  const params = sdStore.currentParams;
  const setParams = sdStore.setCurrentParams;

  const handleSubmit = () => {
    const columns = getParams?.(currentModel, params);
    const reqParams: any = {};
    for (let i = 0; i < columns.length; i++) {
      const item = columns[i];
      reqParams[item.value] = params[item.value] ?? null;
      if (item.required) {
        if (!reqParams[item.value]) {
          showToast(Locale.SdPanel.ParamIsRequired(item.name));
          return;
        }
      }
    }
    let data: any = {
      model: currentModel.value,
      model_name: currentModel.name,
      status: "wait",
      params: reqParams,
      created_at: new Date().toLocaleString(),
      img_data: "",
    };
    sdStore.sendTask(data, () => {
      setParams(getModelParamBasicData(columns, params, true));
      navigate(Path.Sd);
    });
  };
  return (
    <SideBarContainer
      onDragStart={onDragStart}
      shouldNarrow={shouldNarrow}
      className={homeStyles["sidebar-show"]}
    >
      <div
        className="window-header"
        data-tauri-drag-region
        style={{
          paddingLeft: 0,
          paddingRight: 0,
        }}
      >
        {
          <div className="window-actions">
            <div className="window-action-button">
              <IconButton
                icon={<ReturnIcon />}
                bordered
                title={Locale.Sd.Actions.ReturnHome}
                onClick={() => navigate(Path.Home)}
              />
            </div>
          </div>
        }

        <div className={`window-header-title`}>
          <div className={`window-header-main-title`}>Stability</div>
        </div>
        <div className="window-actions">
          <div className="window-action-button">
            <IconButton
              icon={<HistoryIcon />}
              bordered
              title={Locale.Sd.Actions.History}
              onClick={() => navigate(Path.Sd)}
            />
          </div>
        </div>
      </div>
      <SideBarBody>
        <SdPanel />
      </SideBarBody>
      <SideBarTail
        primaryAction={
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
            <IconButton icon={<GithubIcon />} shadow />
          </a>
        }
        secondaryAction={
          <IconButton
            text={Locale.SdPanel.Submit}
            type="primary"
            shadow
            onClick={handleSubmit}
          ></IconButton>
        }
      />
    </SideBarContainer>
  );
}
