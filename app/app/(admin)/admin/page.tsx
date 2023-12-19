"use client";
import { Grid, Col, Card, Text, AreaChart, Metric } from "@tremor/react";

export default function AdminPage() {
  return (
    <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-2">
      <Col numColSpan={1} numColSpanLg={2}>
        <Card>
          <Text>Title</Text>
          {/*<AreaChart*/}
          {/*    className="mt-6 h-28"*/}
          {/*    data={data}*/}
          {/*    index="Month"*/}
          {/*    valueFormatter={(number: number) =>*/}
          {/*        `${Intl.NumberFormat("us").format(number).toString()}`*/}
          {/*    }*/}
          {/*    categories={["Total Visitors"]}*/}
          {/*    colors={["blue"]}*/}
          {/*    showXAxis={true}*/}
          {/*    showGridLines={false}*/}
          {/*    startEndOnly={true}*/}
          {/*    showYAxis={false}*/}
          {/*    showLegend={false}*/}
          {/*/>*/}
        </Card>
      </Col>
      <Card>
        <Text>Title</Text>
        <Metric>KPI 2</Metric>
      </Card>
      <Col>
        <Card>
          <Text>Title</Text>
          <Metric>KPI 3</Metric>
        </Card>
      </Col>
    </Grid>
  );
}
