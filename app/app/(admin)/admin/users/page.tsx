"use client";

import { Flex } from "antd";
import prisma from "@/lib/prisma";
import { Space, Table, Tag } from "antd";

const { Column, ColumnGroup } = Table;

async function getData() {
  const users = await prisma.user.findMany();
  return users;
}
export default async function UsersPage() {
  const data = await getData();
  console.log("data", data);

  return (
    <>
      <Flex gap="middle" vertical>
        <Table dataSource={data}>
          {/*<Column title="ID" dataIndex="id" key="id" hidden={true}/>*/}
          <Column title="Name" key="name" dataIndex="name" />
          <Column title="UserName" key="username" dataIndex="username" />
          <Column title="email" key="email" dataIndex="email" />
        </Table>
      </Flex>
    </>
  );
}
