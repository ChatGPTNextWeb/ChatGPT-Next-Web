import { Flex } from "antd";
import UsersTablePart from "../../components/users-table";

export default async function UsersPage() {
  return (
    <>
      <Flex gap="middle" vertical>
        <UsersTablePart />
      </Flex>
    </>
  );
}
