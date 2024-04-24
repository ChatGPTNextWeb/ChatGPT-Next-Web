"use client";
import type { FormProps } from "antd";
import { Button, Checkbox, Form, Input, Table } from "antd";
import { useEffect, useState } from "react";
import { Setting } from "@prisma/client";

function SettingForm() {
  const [setting, setSetting] = useState<Setting[]>([]);

  useEffect(() => {
    fetch("/api/admin/setting", {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((result) => {
        setSetting(result["result"]);
      });
  }, []);

  const columns = [
    {
      title: "key",
      dataIndex: "key",
      key: "key",
    },
    {
      title: "value",
      dataIndex: "value",
    },
    {
      title: "type",
      dataIndex: "type",
    },
    {
      title: "action",
      dataIndex: "",
      key: "key",
      render: (_, record) => (
        <>
          <Button>编辑</Button>
        </>
      ),
    },
  ];

  return <Table dataSource={setting} columns={columns} />;
}

export default SettingForm;
