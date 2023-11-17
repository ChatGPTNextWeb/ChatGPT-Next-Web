"use client";
import React, { useEffect, useState } from "react";
// import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loading } from "@/app/components/chatHomepage";
import { EmployeeItem, HelpOption } from "../types";
import EmployeeCVSummary from "./employeeCVSummary";
import { ErrorBoundary } from "../../components/error";
import {
  aliasFromEmail,
  sortEmployeeByName,
  useMobileScreen,
} from "../../utils";
import styles from "../components/salesGPT.module.scss";
import { getClientConfig } from "../../config/client";
import { useNavigate } from "react-router-dom";
import Locale from "../../locales";
import EmployeeSelect from "./employeeSelect";
import { IconButton } from "../../components/button";
import { SalesSidebar } from "./sales-sidebar";
import { Path } from "../../constant";
import ChatIcon from "../../icons/chat.svg";
import MaxIcon from "../../icons/max.svg";
import MinIcon from "../../icons/min.svg";
import HelpSelect from "./helpSelect";
import { useAppConfig } from "../../store";
import SalesGPTExplanation from "./salesGPTExplanation";

const availableHelp: HelpOption[] = [
  {
    label: Locale.SalesGPT.Help.Summary,
    value: "summary",
  },
];

function _SalesGPT() {
  const navigate = useNavigate();
  const isMobileScreen = useMobileScreen();
  const config = useAppConfig();
  const title = Locale.SalesGPT.Title;

  const shouldTightBorder =
    getClientConfig()?.isApp || (config.tightBorder && !isMobileScreen);

  const [employees, setEmployees] = useState<EmployeeItem[]>([]);

  // TODO: Select initial employee from query params?
  // const selectedEmployeeAlias = useSearchParams().get("employeeAlias") ?? "";
  const [selectedEmployee, setSelectedEmployee] = useState<
    EmployeeItem | undefined
  >(undefined);

  const [requirementText, setRequirementText] = useState("");
  const [summaryText, setSummaryText] = useState("");
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);

  const [selectedHelp, setSelectedHelp] = useState(availableHelp[0]);

  function handleSelectEmployee(newValue: EmployeeItem | undefined): void {
    setSelectedEmployee(newValue);
    // TODO: Handle query params later
    // if (newValue === undefined) {
    //   router.push(pathName);
    // } else {
    //   router.push(
    //     pathName + `?employeeAlias=${aliasFromEmail(newValue?.email)}`,
    //   );
    // }
  }

  // TODO: Dette er dårlig. Men skal fikses senere
  function handleClearSelectedEmployee() {
    setGeneratedText(null);
  }

  useEffect(() => {
    fetch("/api/chewbacca/employees", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        const data = (await response.json()) as EmployeeItem[];
        data.sort(sortEmployeeByName);
        setEmployees(data ?? []);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const [showCVSummary, setshowCVSummary] = useState(false);

  useEffect(() => {
    setshowCVSummary(generatedText != null && !isAnalysisLoading);
  }, [isAnalysisLoading, generatedText]);

  async function handleAnalyseButtonClick(): Promise<void> {
    setIsAnalysisLoading(true);
    const requirements = requirementText.split("\n").filter((s) => s.length);
    const employeeAlias = aliasFromEmail(selectedEmployee?.email);
    await fetch("/api/chewbacca/generateSummaryOfQualifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ employeeAlias, requirements, summaryText }),
    })
      .then(async (response) => {
        if (response.status === 401) {
          window.location.href = "/api/auth/signin";
        }
        return await response.json();
      })
      .then((data) => {
        setGeneratedText(data);
        setIsAnalysisLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setIsAnalysisLoading(false);
      });
  }

  return (
    <div
      className={
        styles.container +
        ` ${shouldTightBorder ? styles["tight-container"] : styles.container}`
      }
    >
      <SalesSidebar title={title} subtitle={""}>
        <div className={styles["sidebar-content"]}>
          <div className={styles["input-field"]}>
            <label htmlFor="choose-help">{Locale.SalesGPT.Help.Choose}</label>
            <HelpSelect
              options={availableHelp}
              selectedHelp={selectedHelp}
              handleSelectHelp={setSelectedHelp}
            />
          </div>
          <div className={styles["input-field"]}>
            <label htmlFor="choose-employee">
              {Locale.SalesGPT.ChooseEmployee}
            </label>
            <EmployeeSelect
              employees={employees}
              selectedEmployee={selectedEmployee}
              handleSelectEmployee={handleSelectEmployee}
              handleClear={handleClearSelectedEmployee}
            />
          </div>
          <div className={styles["input-field"]}>
            <label htmlFor="requirements">{Locale.SalesGPT.Requirements}</label>
            <textarea
              id="requirements"
              className={styles["text-input"]}
              placeholder={Locale.SalesGPT.RequirementsPlaceholder}
              value={requirementText}
              onChange={(event) => setRequirementText(event.target.value)}
            ></textarea>
          </div>
          <div className={styles["input-field"]}>
            <label htmlFor="summary">{Locale.SalesGPT.Summary}</label>
            <textarea
              id="requirements"
              className={styles["text-input"]}
              placeholder={Locale.SalesGPT.SummaryPlaceholder}
              value={summaryText}
              onChange={(event) => setSummaryText(event.target.value)}
            ></textarea>
          </div>
          <div className={styles["analyse-button-container"]}>
            <IconButton
              key="analyse"
              bordered
              className={styles["analyse-button"]}
              text={Locale.SalesGPT.Analyse}
              onClick={handleAnalyseButtonClick}
            />
          </div>
        </div>
        <IconButton
          text={"Tilbake til chat"}
          icon={<ChatIcon />}
          onClick={() => navigate(Path.Home)}
        />
      </SalesSidebar>

      <div
        style={{ overflow: "auto" }}
        className={styles["window-content"] + " " + styles["right-pane"]}
      >
        <div className={styles["window-header"]} data-tauri-drag-region>
          <div className={`window-header-title ${styles["chat-body-title"]}`}>
            <div
              className={`window-header-main-title ${styles["chat-body-main-title"]}`}
            >
              {selectedHelp.value === "summary" && Locale.SalesGPT.ResultTitle}
            </div>
          </div>
          <div className={styles["window-actions"]}>
            <div className={styles["window-action-button"]}>
              <IconButton
                icon={config.tightBorder ? <MinIcon /> : <MaxIcon />}
                bordered
                onClick={() => {
                  config.update(
                    (config) => (config.tightBorder = !config.tightBorder),
                  );
                }}
              />
            </div>
          </div>
        </div>
        {/* TODO: Gjør dette på en bedre måtte. Dette er ikke bra */}
        {isAnalysisLoading ? (
          <Loading noLogo />
        ) : showCVSummary ? (
          <EmployeeCVSummary
            employee={selectedEmployee}
            generatedText={generatedText}
          />
        ) : (
          <SalesGPTExplanation />
        )}
      </div>
    </div>
  );
}

export default function SalesGPT() {
  return (
    <ErrorBoundary fallback={<p> Something went wrong with the SalesGPT! </p>}>
      <_SalesGPT />
    </ErrorBoundary>
  );
}
