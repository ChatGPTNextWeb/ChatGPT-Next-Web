"use client";
import React from "react";
import styles from "../components/employeeCVSummary.module.scss";
import { EmployeeItem } from "../types";
import { Loading } from "@/app/components/chatHomepage";
import Locale from "../../locales";
import { ErrorBoundary } from "../../components/error";

type EmployeeCVSummaryProps = {
  employee: EmployeeItem | undefined;
  isLoading: boolean;
  generatedText: string;
};

function EmptyEmployeeSummary() {
  return (
    <div className={styles["empty"]}>
      <div className={styles["content-box"]}>
        <span className={styles["emoji"]}>&#x1F916;</span>
        <p className={styles["text"]}>
          {Locale.SalesGPT.EmployeeCVSummary.Empty}
        </p>
      </div>
    </div>
  );
}

function _EmployeeCVSummary({
  employee,
  isLoading,
  generatedText,
}: EmployeeCVSummaryProps) {
  if (isLoading) {
    return <Loading noLogo />;
  }

  if (employee && generatedText) {
    return (
      <div className={styles["results"]}>
        <p className={styles["title"]}>{Locale.SalesGPT.ResultTitle}</p>
        <div className={styles["content"]}>
          <div className={styles["text"]}>{generatedText}</div>
        </div>
      </div>
    );
  }

  return <EmptyEmployeeSummary />;
}

export default function EmployeeCVSummary({
  employee,
  isLoading,
  generatedText,
}: EmployeeCVSummaryProps) {
  return (
    <ErrorBoundary
      fallback={<p> Something went wrong with the EmployeeCV! </p>}
    >
      <_EmployeeCVSummary
        isLoading={isLoading}
        employee={employee}
        generatedText={generatedText}
      />
    </ErrorBoundary>
  );
}
