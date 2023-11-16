"use client";
import React, { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EmployeeItem, EmployeeOption } from "../salesGPT/types";
import EmployeeCVSummary from "./employeeCVSummary";
import { ErrorBoundary } from "./error";
import LayoutWrapper from "./layoutWrapper";
import { aliasFromEmail } from "../utils";
import { Settings } from "./settings";
import styles from "../components/salesGPT.module.scss";
import { useLocation } from "react-router-dom";

function _SalesGPT() {
  const router = useRouter();
  const pathName = usePathname();

  const [openSettings, setOpenSettings] = useState(false);

  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const location = useLocation();

  useEffect(() => {
    fetch("/api/chewbacca/employees", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        const data = (await response.json()) as EmployeeItem[];
        setEmployees(data ?? []);
        const searchParams = new URLSearchParams(location.search);
        const selectedEmployeeAlias = searchParams.get("employeeAlias") ?? "";
        const employee = data.find(
          (emp) => aliasFromEmail(emp.email) === selectedEmployeeAlias,
        );
        setSelectEmployee({ label: employee?.name ?? "", value: employee });
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const [selectedEmployeeOption, setSelectEmployee] =
    useState<EmployeeOption | null>({
      label: "",
      value: undefined,
    });
  const options: EmployeeOption[] = employees.map((emp: EmployeeItem) => ({
    value: emp,
    label: emp.name,
  }));

  function handleSelectEmployee(newValue: SingleValue<EmployeeOption>): void {
    setSelectEmployee(newValue);
    router.push(
      pathName +
        `?employeeAlias=${aliasFromEmail(newValue?.value?.email ?? "")}`,
    );
  }

  return (
    <LayoutWrapper>
      <Select
        options={options}
        isSearchable={true}
        value={selectedEmployeeOption}
        onChange={handleSelectEmployee}
      />

      <div style={{ overflow: "auto" }} className={styles["window-content"]}>
        {openSettings ? (
          <Settings />
        ) : (
          // Her kan man bytte ut vindu avhengig av valgt funksjon på sikt
          <EmployeeCVSummary employee={selectedEmployeeOption?.value} />
        )}
      </div>
    </LayoutWrapper>
  );
}

interface SalesGPTProps {
  employees: EmployeeItem[];
}

export default function SalesGPT() {
  return (
    <ErrorBoundary fallback={<p> Something went wrong with the SalesGPT! </p>}>
      <_SalesGPT />
    </ErrorBoundary>
  );
}
