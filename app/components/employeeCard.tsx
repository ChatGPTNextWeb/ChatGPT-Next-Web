import React from "react";
import styles from "./employeeCard.module.scss";

export default function EmployeeCard(props: {
  employeeName: string;
  employeeRole: string;
  employeeImageSrc: string;
}) {
  return (
    <div className={styles["employeeCard"]}>
      <div>
        <h2>{props.employeeName}</h2>
        <p>{props.employeeRole}</p>
      </div>
      <img
        src={props.employeeImageSrc}
        alt={`bilde av ${props.employeeName}`}
      />
    </div>
  );
}
