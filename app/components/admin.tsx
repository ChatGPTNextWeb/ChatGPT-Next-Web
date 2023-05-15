import { useEffect, useState } from "react";
import { Button, Form, Input, message, Modal, Select, Table } from "antd";

const { Option } = Select;

interface IData {
  api_key: string;
  balance: number;
  createdAt: string;
  endTime: string;
  seconds: number; // 周期
}

enum SubscribeType {
  trial = "trial",
  week = "week",
  month = "month",
  quarter = "quarter",
  halfYear = "halfYear",
}

interface IAddData {
  subscribe_type: SubscribeType;
  wechat: string;
  remark: string;
  password: string;
}

export function Admin(): JSX.Element {
  const [data, setData] = useState<IData[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [adminPasswordVisible, setAdminPasswordVisible] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  const [form] = Form.useForm();
  const [adminPasswordFrom] = Form.useForm();
  const fetchData = async () => {
    if (!adminPassword) {
      setData([]);
      setTotal(0);
      return;
    }
    const response = await fetch(
      `api/overview?password=${adminPassword}&page=${page}`,
    );
    const result = await response.json();
    if (result.error) {
      message.error(result.error);
      return;
    }
    console.log(result);
    setData(result);
    setTotal(result.length);
  };
  useEffect(() => {
    fetchData();
  }, [page, adminPassword]);

  const columns = [
    {
      title: "Subscribe Type",
      dataIndex: "subscribe_type",
      key: "subscribe_type",
    },
    {
      title: "Key",
      dataIndex: "api_key",
      key: "api_key",
    },
    {
      title: "Wechat",
      dataIndex: "wechat",
      key: "wechat",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "EndTime",
      dataIndex: "endTime",
      key: "endTime",
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
    },
    {
      title: "Remark",
      dataIndex: "remark",
      key: "remark",
    },
  ];

  const handleNew = () => {
    setModalVisible(true);
  };

  const handleSetAdminPassword = () => {
    setAdminPasswordVisible(true);
  };

  const handleAdminPasswordOk = async () => {
    const { adminPassword } = await adminPasswordFrom.validateFields();
    setAdminPassword(adminPassword);
    setAdminPasswordVisible(false);
    // message.success("set adminPassword successfully");
  };

  const handleAdminPasswordCancel = async () => {
    setAdminPasswordVisible(false);
    adminPasswordFrom.resetFields();
  };

  const handleOk = async () => {
    setAddLoading(true);
    try {
      const values = (await form.validateFields()) as IAddData;
      const { subscribe_type, wechat, remark } = values;

      const response = await fetch(`api/user`, {
        method: "POST",
        body: JSON.stringify({
          subscribe_type,
          wechat,
          remark,
          password: adminPassword,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        message.success("Add new key successfully");
        setModalVisible(false);
        form.resetFields();
        setPage(1);
        fetchData();
      } else {
        message.error(result.message);
      }
    } catch (error) {
      console.error(error);
    }
    setAddLoading(false);
  };

  const handleCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  return (
    <div>
      <Button type="primary" onClick={handleNew} style={{ marginRight: 10 }}>
        New Key
      </Button>
      <Button type="primary" onClick={handleSetAdminPassword}>
        Set Admin Password
      </Button>
      <Table
        dataSource={data}
        columns={columns}
        pagination={{
          pageSize: 10,
          current: page,
          total: total,
          onChange: (page, pageSize) => setPage(page),
        }}
      />
      <Modal
        title="New Key"
        visible={modalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={addLoading}
      >
        <Form form={form}>
          <Form.Item
            name="subscribe_type"
            label="Subscribe Type"
            rules={[{ required: true, message: "Please enter Subscribe Type" }]}
          >
            <Select defaultValue={SubscribeType.trial}>
              <Option value={SubscribeType.trial}>Trial</Option>
              <Option value={SubscribeType.week}>Week</Option>
              <Option value={SubscribeType.month}>Month</Option>
              <Option value={SubscribeType.quarter}>Quarter</Option>
              <Option value={SubscribeType.halfYear}>Half Year</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="wechat"
            label="Wechat ID"
            rules={[{ required: false, message: "Please enter wechat" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="remark"
            label="Remark"
            rules={[{ required: false, message: "Please enter remark" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="adminPasswordVisible"
        visible={adminPasswordVisible}
        onOk={handleAdminPasswordOk}
        onCancel={handleAdminPasswordCancel}
      >
        <Form form={adminPasswordFrom}>
          <Form.Item
            name="adminPassword"
            label="Admin Password"
            rules={[{ required: false, message: "Please enter password" }]}
          >
            <Input type="password" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Admin;
