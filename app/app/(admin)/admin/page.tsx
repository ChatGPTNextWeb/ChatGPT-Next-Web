// "use client";
import { Grid, Col, Card, Text, AreaChart, Metric } from "@tremor/react";
import UsageAnalysis from "./usage-analysis";

export default function AdminPage() {
  return (
    <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-2">
      <Col numColSpan={2} numColSpanLg={3}>
        <UsageAnalysis />
      </Col>
      <Col>
        <Card>
          <Text>Title</Text>
          <Metric>KPI 2</Metric>
        </Card>
      </Col>
    </Grid>
  );
}
