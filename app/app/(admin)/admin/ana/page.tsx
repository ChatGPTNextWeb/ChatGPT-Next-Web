import UsageByModel from "./usage-by-model-chart";
// import UserByMap from "./user-by-map";

import { Flex } from "antd";

export default async function AdminPage() {
  return (
    <>
      <Flex gap="middle" vertical>
        <UsageByModel />
        {/*<UserByMap />*/}
      </Flex>
    </>
  );
}
