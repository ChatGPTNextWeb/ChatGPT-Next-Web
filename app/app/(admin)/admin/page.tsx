import { Grid, Col, Card, Text, AreaChart, Metric } from "@tremor/react";
import UsageByModel from "./usage-by-model";
import { getSession, ADMIN_LIST, isName } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getSession();
  if (!(session?.user?.name && ADMIN_LIST.includes(session.user.name))) {
    // Replace '/dashboard' with the desired redirect path
    redirect("/");
  }

  return (
    <>
      <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-2">
        <Col numColSpan={1} numColSpanLg={1}>
          {/*<UsageAnalysis />*/}
          {/*<Card></Card>*/}
        </Col>
        <Col numColSpan={1} numColSpanLg={2}>
          <UsageByModel />
        </Col>
      </Grid>
    </>
  );
}
