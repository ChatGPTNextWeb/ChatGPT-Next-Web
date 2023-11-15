import { redirect, useSearchParams } from "next/navigation";

import { getServerSession } from "next-auth/next";

import { authOptions } from "../api/auth/auth-options";
import getAllEmployees from "../function/Employees";
import SalesGPT from "../components/salesGPT";

export default async function App() {
  const employees = await getAllEmployees();
  const session = await getServerSession(authOptions);
  if (!session) {
    return redirect("/api/auth/signin");
  }
  if (employees) {
    return <SalesGPT employees={employees} />;
  }
}
