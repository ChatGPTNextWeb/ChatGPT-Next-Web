"use client";
import type { FormProps } from "antd";
import {
  Button,
  Checkbox,
  Form,
  Input,
  Modal,
  Space,
  Table,
  TableColumnsType,
  Radio,
  Flex,
} from "antd";
import { useEffect, useState } from "react";
import { Setting } from "@prisma/client";

function SettingForm() {
  const [modal, contextHolder] = Modal.useModal();
  const [form] = Form.useForm();

  const [setting, setSetting] = useState<Setting[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  const handleFormSubmit = async (record: Setting) => {
    console.log("-------", record);
  };

  const handelDel = (record: Setting) => {
    fetch(`/api/admin/setting/${record.key}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((result) => {
        console.log("删除成功，", result);
      });
  };

  const handleEdit = (method: "POST" | "PUT", record: Setting | undefined) => {
    modal.confirm({
      title: "编辑设置",
      content: (
        <Form
          form={form}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
          layout="horizontal"
          initialValues={record}
          preserve={false}
        >
          <Form.Item
            name="key"
            label="key"
            rules={[{ required: true, message: "请输入key" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="value"
            label="value"
            rules={[{ required: true, message: "请输入value" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="type"
            label="type"
            rules={[{ required: true, message: "请输入type" }]}
          >
            <Radio.Group>
              <Radio.Button value="string">string</Radio.Button>
              <Radio.Button value="boolean">boolean</Radio.Button>
              <Radio.Button value="number">number</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Form>
      ),
      onOk: () => {
        const setting_key = method === "PUT" ? record?.key : "";
        form.validateFields().then((values) => {
          console.log("提交，，，", values);
          fetch(`/api/admin/setting/${setting_key}`, {
            method: method,
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          })
            .then((response) => response.json())
            .then((result) => {
              console.log("创建结果，", result);
            });
        });
      },
    });
  };

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

  const columns: TableColumnsType<Setting> = [
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
      render: (_: string, record: Setting) => (
        <Space size="small">
          <a type="link" onClick={() => handleEdit("PUT", record)}>
            编辑
          </a>
          <a type="link" onClick={() => handelDel(record)}>
            删除
          </a>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Flex vertical>
        <Button type="link" onClick={() => handleEdit("POST", undefined)}>
          创建
        </Button>
        <Table dataSource={setting} columns={columns} />
      </Flex>
      {contextHolder}
    </>
  );
}

export default SettingForm;
