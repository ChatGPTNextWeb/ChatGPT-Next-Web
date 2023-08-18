import React from "react";
import styles from "./employeeCard.module.scss";
import Link from "next/link";

export default function EmployeeCard(props: {
  employeeName: string;
  employeeRole: string;
  employeeImageSrc: string;
  href: string;
}) {
  return (
    <li className={styles["list"]}>
      <Link className={styles["employeeCard"]} href={props.href}>
        <div>
          <p className={styles["employeeName"]}>{props.employeeName}</p>
          <p>{props.employeeRole}</p>
        </div>
        <img
          src={props.employeeImageSrc}
          alt={`bilde av ${props.employeeName}`}
        />
      </Link>
    </li>
  );
}
