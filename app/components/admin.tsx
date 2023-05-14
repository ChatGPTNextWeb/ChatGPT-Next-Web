import { useEffect, useState } from "react";
import { Table } from "antd";

interface IData {
  api_key: string;
  balance: number;
  createdAt: string;
  endTime: string;
  seconds: number; // 周期
}

export function Admin(): JSX.Element {
  const [data, setData] = useState<IData[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const password = "test";
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `api/overview?password=${password}&page=${page}`,
      );
      const result = await response.json();
      console.log("overview", result);
      setData(result);
      setTotal(result.length);
    };
    fetchData();
  }, [page]);

  const columns = [
    {
      title: "api-key",
      dataIndex: "api_key",
      key: "api_key",
    },
    {
      title: "balance",
      dataIndex: "balance",
      key: "balance",
    },
    {
      title: "seconds",
      dataIndex: "seconds",
      key: "seconds",
    },
    {
      title: "endTime",
      dataIndex: "endTime",
      key: "endTime",
    },
    {
      title: "createdAt",
      dataIndex: "createdAt",
      key: "createdAt",
    },
  ];

  return (
    <div>
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
    </div>
  );
}
