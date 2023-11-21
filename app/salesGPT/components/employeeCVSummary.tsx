"use client";
import React from "react";
import styles from "../components/employeeCVSummary.module.scss";
import { EmployeeItem } from "../types";
import { ErrorBoundary } from "../../components/error";
import Message from "./message";
import { RequirementResponse } from "@/app/api/chewbacca/generateRequirementResponse/route";

type EmployeeCVSummaryProps = {
  employee: EmployeeItem | undefined;
  generatedText: string | null;
  requirementResponse: RequirementResponse[];
};

function _EmployeeCVSummary({
  employee,
  generatedText,
  requirementResponse,
}: EmployeeCVSummaryProps) {
  if (employee && generatedText) {
    return (
      <div className={styles["results"]}>
        {/* Display Requirement Response List */}
        <div className={styles["requirement-response-list"]}>
          {requirementResponse.map((item, index) => (
            <div key={index}>
              <h3>Requirement: {item.requirement}</h3>
              <p>Response: {item.response}</p>
              <p>Experience: {item.experience}</p>
            </div>
          ))}
        </div>

        <Message message={generatedText} />
      </div>
    );
  }
  // ...
}

export default function EmployeeCVSummary({
  employee,
  generatedText,
  requirementResponse,
}: EmployeeCVSummaryProps) {
  return (
    <ErrorBoundary
      fallback={<p> Something went wrong with the EmployeeCV! </p>}
    >
      <_EmployeeCVSummary
        employee={employee}
        generatedText={generatedText}
        requirementResponse={requirementResponse}
      />
    </ErrorBoundary>
  );
}
