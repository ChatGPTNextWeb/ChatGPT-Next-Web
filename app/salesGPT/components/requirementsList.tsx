"use client";
import React from "react";
import styles from "../components/requirementsList.module.scss";
import { ErrorBoundary } from "../../components/error";
import Message from "./message";
import { RequirementResponse } from "@/app/api/chewbacca/generateRequirementResponse/route";

type RequirementsListProps = {
  requirementResponse: RequirementResponse[];
};

function _RequirementsList({ requirementResponse }: RequirementsListProps) {
  return (
    <div className={styles["requirement-response-list"]}>
      {requirementResponse.map((item, index) => (
        <div key={index}>
          <Message title={item.requirement} message={item.response} />
        </div>
      ))}
    </div>
  );
}

export default function RequirementsList({
  requirementResponse,
}: RequirementsListProps) {
  return (
    <ErrorBoundary
      fallback={<p> Something went wrong with the requirements list! </p>}
    >
      <_RequirementsList requirementResponse={requirementResponse} />
    </ErrorBoundary>
  );
}
