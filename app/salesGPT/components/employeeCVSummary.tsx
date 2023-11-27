"use client";
import React from "react";
import styles from "../components/employeeCVSummary.module.scss";
import { EmployeeItem } from "../types";
import { ErrorBoundary } from "../../components/error";
import Message from "./message";

type EmployeeCVSummaryProps = {
  employee: EmployeeItem | undefined;
  generatedSummary: string | null;
};

function _EmployeeCVSummary({
  employee,
  generatedSummary: generatedText,
}: EmployeeCVSummaryProps) {
  if (employee && generatedText) {
    return (
      <div className={styles["results"]}>
        <Message message={generatedText} />
      </div>
    );
  }
  // ...
}

export default function EmployeeCVSummary({
  employee,
  generatedSummary: generatedText,
}: EmployeeCVSummaryProps) {
  return (
    <ErrorBoundary
      fallback={<p> Something went wrong with the EmployeeCV! </p>}
    >
      <_EmployeeCVSummary
        employee={employee}
        generatedSummary={generatedText}
      />
    </ErrorBoundary>
  );
}
