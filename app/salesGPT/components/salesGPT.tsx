"use client";
import React, { useEffect, useState } from "react";
import { Loading } from "@/app/components/chatHomepage";
import { EmployeeItem, HelpOption, HelpOptionValue } from "../types";
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
import HelpSelect from "./helpSelect";
import { useAppConfig } from "../../store";
import SalesGPTExplanation from "./salesGPTExplanation";
import { RequirementResponse } from "@/app/api/chewbacca/generateRequirementResponse/route";
import RightPane from "./rightPane";
import RequirementsList from "./requirementsList";

const availableHelp: HelpOption[] = [
  {
    label: Locale.SalesGPT.Help.Summary,
    value: HelpOptionValue.Summary,
  },
  {
    label: Locale.SalesGPT.Help.RequirementList,
    value: HelpOptionValue.RequirementList,
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
  const [requirementResponse, setRequirementResponse] = useState<
    RequirementResponse[]
  >([]);
  const [summaryText, setSummaryText] = useState("");
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);

  const [selectedHelp, setSelectedHelp] = useState<HelpOption | undefined>(
    undefined,
  );

  const [showCVSummary, setShowCVSummary] = useState(false);
  const [showRequirementsList, setShowRequirementsList] = useState(false);

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
    setShowCVSummary(false);
    setShowRequirementsList(false);
    setIsAnalysisLoading(false);
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

  const fetchRequirements = async (
    employeeAlias: string,
    requirements: string[],
  ): Promise<RequirementResponse[]> => {
    const requirementPromises = requirements.map(async (requirement) => {
      const response = await fetch(
        "/api/chewbacca/generateRequirementResponse",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ employeeAlias, requirement }),
        },
      );
      const data = await response.json();
      return data;
    });

    const requirementResponses = await Promise.all(requirementPromises);
    return requirementResponses;
  };

  const runSummaryAnalysis = async (
    employeeAlias: string,
    requirements: string[],
    summaryText: string,
  ) => {
    await fetchRequirements(employeeAlias, requirements)
      .then(async (requirementResponses) => {
        const response = await fetch(
          "/api/chewbacca/generateSummaryOfQualifications",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ requirementResponses, summaryText }),
          },
        );
        const data = await response.json();
        return data;
      })
      .then((data) => {
        setGeneratedText(data);
        setShowCVSummary(true);

        setRequirementResponse([]);
        setIsAnalysisLoading(false);
        setShowRequirementsList(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setRequirementResponse([]);
        setGeneratedText(null);
        setIsAnalysisLoading(false);
        setShowRequirementsList(false);
        setShowCVSummary(false);
        return;
      });
  };

  const runRequirementListAnalysis = async (
    employeeAlias: string,
    requirements: string[],
  ) => {
    await fetchRequirements(employeeAlias, requirements)
      .then((data) => {
        setRequirementResponse(data);
        setShowRequirementsList(true);

        setGeneratedText(null);
        setIsAnalysisLoading(false);
        setShowCVSummary(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setRequirementResponse([]);
        setGeneratedText(null);
        setIsAnalysisLoading(false);
        setShowRequirementsList(false);
        setShowCVSummary(false);
        return;
      });
  };

  async function handleAnalyseButtonClick(): Promise<void> {
    setIsAnalysisLoading(true);
    setRequirementResponse([]);
    const requirements = requirementText.split("\n").filter((s) => s.length);
    const employeeAlias = aliasFromEmail(selectedEmployee?.email);

    if (selectedHelp?.value == HelpOptionValue.RequirementList) {
      await runRequirementListAnalysis(employeeAlias, requirements);
    } else if (selectedHelp?.value == HelpOptionValue.Summary) {
      await runSummaryAnalysis(employeeAlias, requirements, summaryText);
    } else {
      return;
    }
  }

  function getRightPaneTitle() {
    switch (selectedHelp?.value) {
      case HelpOptionValue.Summary:
        return Locale.SalesGPT.EmployeeCVSummary.Title;
      case HelpOptionValue.RequirementList:
        return Locale.SalesGPT.RequirementList.Title;
      default:
        return "";
    }
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

      <RightPane title={getRightPaneTitle()}>
        {/* TODO: Gjør dette på en bedre måtte. Dette er ikke bra */}
        {isAnalysisLoading ? (
          <Loading noLogo />
        ) : showCVSummary ? (
          <EmployeeCVSummary
            employee={selectedEmployee}
            generatedText={generatedText}
          />
        ) : showRequirementsList ? (
          <RequirementsList requirementResponse={requirementResponse} />
        ) : (
          <SalesGPTExplanation />
        )}
      </RightPane>
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
