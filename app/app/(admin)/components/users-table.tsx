"use client";

import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { User } from "@prisma/client";
import { Space, Table, Tag, Input, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { FilterDropdownProps } from "antd/es/table/interface";
import type { GetRef, TableColumnsType, TableColumnType } from "antd";
import Highlighter from "react-highlight-words";
// 后期考虑删除该依赖

import type { SearchProps } from "antd/es/input/Search";

const { Search } = Input;

import { getCurrentTime } from "@/app/utils/custom";

interface UserInterface {
  users: User[];
  setUsers: Dispatch<SetStateAction<User[]>>;
  loading: Boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
}
interface SearchTextProps {
  searchText: string;
  setSearchText: Dispatch<SetStateAction<string>>;
}

type DataIndex = keyof User;
type InputRef = GetRef<typeof Input>;

function UserTableSearchInput({ users, setUsers, setLoading }: UserInterface) {
  const [searchText, setSearchText] = useState("");
  // 这里直接搜索，并获取数据不传递搜索的值给表格了。
  const onSearch: SearchProps["onSearch"] = (value, _e, info) => {
    setSearchText(value);
  };

  useEffect(() => {
    setLoading(true);
    const fetchUsers = async () => {
      try {
        const url = new URL("/api/admin/users/", window.location.href);
        url.searchParams.append("search", searchText);
        console.log(url, "url");
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setUsers(data["results"]);
          setLoading(false);
        }
      } catch (e) {
        setLoading(false);
        console.log("fetch user error: ", e);
      }
    };

    fetchUsers();
    console.log(users, "users1");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  return (
    <Search
      placeholder="input search text"
      onSearch={onSearch}
      enterButton
      style={{ width: 304 }}
    />
  );
}

function UsersTable({ users, setUsers, loading }: UserInterface) {
  // const [searchText, setSearchText] = useState("");
  // const [searchedColumn, setSearchedColumn] = useState("");
  // const searchInput = useRef<InputRef>(null);
  // const handleSearch = (
  //   selectedKeys: string[],
  //   confirm: FilterDropdownProps["confirm"],
  //   dataIndex: DataIndex,
  // ) => {
  //   confirm();
  //   setSearchText(selectedKeys[0]);
  //   setSearchedColumn(dataIndex);
  // };

  // const handleReset = (clearFilters: () => void) => {
  //   clearFilters();
  //   setSearchText("");
  // };

  // const getColumnSearchProps = (
  //   dataIndex: DataIndex,
  // ): TableColumnType<User> => ({
  //   filterDropdown: ({
  //     setSelectedKeys,
  //     selectedKeys,
  //     confirm,
  //     clearFilters,
  //     close,
  //   }) => (
  //     <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
  //       <Input
  //         ref={searchInput}
  //         placeholder={`Search ${dataIndex}`}
  //         value={selectedKeys[0]}
  //         onChange={(e) =>
  //           setSelectedKeys(e.target.value ? [e.target.value] : [])
  //         }
  //         onPressEnter={() =>
  //           handleSearch(selectedKeys as string[], confirm, dataIndex)
  //         }
  //         style={{ marginBottom: 8, display: "block" }}
  //       />
  //       <Space>
  //         <Button
  //           type="primary"
  //           onClick={() =>
  //             handleSearch(selectedKeys as string[], confirm, dataIndex)
  //           }
  //           icon={<SearchOutlined />}
  //           size="small"
  //           style={{ width: 90 }}
  //         >
  //           Search
  //         </Button>
  //         <Button
  //           onClick={() => clearFilters && handleReset(clearFilters)}
  //           size="small"
  //           style={{ width: 90 }}
  //         >
  //           Reset
  //         </Button>
  //         <Button
  //           type="link"
  //           size="small"
  //           onClick={() => {
  //             confirm({ closeDropdown: false });
  //             setSearchText((selectedKeys as string[])[0]);
  //             setSearchedColumn(dataIndex);
  //           }}
  //         >
  //           Filter
  //         </Button>
  //         <Button
  //           type="link"
  //           size="small"
  //           onClick={() => {
  //             close();
  //           }}
  //         >
  //           close
  //         </Button>
  //       </Space>
  //     </div>
  //   ),
  //   filterIcon: (filtered: boolean) => (
  //     <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
  //   ),
  //   onFilter: (value, record: User) => {
  //     let result = record?.[dataIndex];
  //     if (result) {
  //       return result
  //         .toString()
  //         .toLowerCase()
  //         .includes((value as string).toLowerCase());
  //     }
  //     return false;
  //   },
  //   onFilterDropdownOpenChange: (visible) => {
  //     if (visible) {
  //       // @ts-ignore
  //       setTimeout(() => searchInput.current?.select(), 100);
  //     }
  //   },
  //   render: (text) =>
  //     searchedColumn === dataIndex ? (
  //       // @ts-ignore
  //       <Highlighter
  //         highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
  //         searchWords={[searchText]}
  //         autoEscape
  //         textToHighlight={text ? text.toString() : ""}
  //       />
  //     ) : (
  //       text
  //     ),
  // });

  const columns: TableColumnsType<User> = [
    { title: "Name", dataIndex: "name" },
    {
      title: "UserName",
      dataIndex: "username",
    },
    { title: "Email", dataIndex: "email" },
    {
      title: "createdAt",
      dataIndex: "createdAt",
      render: (value) => getCurrentTime(new Date(value)),
      sorter: (a, b) => {
        if (a.createdAt < b.createdAt) return 1;
        return -1;
      },
    },
    {
      title: "updatedAt",
      dataIndex: "updatedAt",
      render: (value) => getCurrentTime(new Date(value)),
    },
    {
      title: "Action",
      dataIndex: "",
      key: "id",
      render: () => (
        <Space size="middle">
          <a>编辑</a>
          <a>删除</a>
        </Space>
      ),
    },
  ];
  console.log(users, "users2");

  return (
    <Table
      dataSource={users}
      rowKey="id"
      columns={columns}
      loading={loading as boolean}
    />
  );
}

function UsersTablePart() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <UserTableSearchInput
        users={users}
        setUsers={setUsers}
        loading={loading}
        setLoading={setLoading}
      />
      <UsersTable
        users={users}
        setUsers={setUsers}
        loading={loading}
        setLoading={setLoading}
      />
    </>
  );
}

export default UsersTablePart;
