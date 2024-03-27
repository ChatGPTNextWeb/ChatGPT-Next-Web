import { Flex } from "antd";
import VoiceInput from "@/app/components/voice-input";

export default async function UsersPage() {
  // const users: User[] = await getData();

  // console.log("data", data);

  return (
    <>
      <Flex gap="middle" vertical>
        <VoiceInput />
      </Flex>
    </>
  );
}
