"use client";
import React, { useEffect, useState } from "react";
import { ErrorBoundary } from "./error";
import { Loading } from "./chatHomepage";
import styles from "../components/employeeCVSummary.module.scss";
import CV from "./CV";
import { EmployeeItem } from "../salesGPT/types";
import { aliasFromEmail } from "../utils";

type EmployeeCVSummaryProps = {
  employee: EmployeeItem | undefined;
};

function _EmployeeCVSummary({ employee }: EmployeeCVSummaryProps) {
  const [requirementText, setRequirementText] = useState("");
  const [generatedText, setGeneratedText] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) {
    return <Loading />;
  }

  async function handleButtonClick(requirementText: string): Promise<void> {
    setIsLoading(true);
    const requirements = requirementText.split("\n").filter((s) => s.length);
    const employeeAlias = aliasFromEmail(employee?.email ?? "");
    await fetch("/api/chewbacca/generateSummaryOfQualifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ employeeAlias, requirements }),
    })
      .then(async (response) => {
        if (response.status === 401) {
          window.location.href = "/api/auth/signin";
        }
        return await response.json();
      })
      .then((data) => {
        setGeneratedText(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log("Error:", error);
        setIsLoading(false);
      });
  }

  return (
    <div>
      <p>Konsulent: {employee?.name}</p>
      <div className={styles["input"]}>
        <textarea
          className={styles["requirements"]}
          placeholder={
            "Kandidaten må ha erfaring med X\nKandidaten må også ha kjennskap til Y\nErfaring med Z er et pluss"
          }
          value={requirementText}
          onChange={(event) => setRequirementText(event.target.value)}
        ></textarea>
        <button onClick={async () => handleButtonClick(requirementText)}>
          Generer oppsummering av kvalifikasjoner
        </button>
      </div>
      <CV GPTResponse={generatedText}></CV>
    </div>
  );
}

export default function EmployeeCVSummary({
  employee,
}: EmployeeCVSummaryProps) {
  return (
    <ErrorBoundary
      fallback={<p> Something went wrong with the EmployeeCV! </p>}
    >
      <_EmployeeCVSummary employee={employee} />
    </ErrorBoundary>
  );
}
