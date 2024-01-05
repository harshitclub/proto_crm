"use client";

import "./style.css";
import usersImage from "../../../../public/adminAssets/users.svg";
import accountsImage from "../../../../public/adminAssets/accounts.svg";
import todosImage from "../../../../public/adminAssets/todos.svg";
import Image from "next/image";
import { Table, Badge } from "antd";
import { CommonBtn } from "@/components/local/Buttons/Buttons";
import {
  RiAddFill,
  RiArrowDownLine,
  RiProfileLine,
  RiSettings3Line,
} from "react-icons/ri";

const columns = [
  {
    title: "Index",
    dataIndex: "key",
  },
  {
    title: "Name",
    dataIndex: "name",
  },
  {
    title: "Designation",
    dataIndex: "designation",
  },
  {
    title: "Status",
    dataIndex: "status",
    render: () => <Badge status="success" text="Active" />,
  },
  {
    title: "Location",
    dataIndex: "location",
  },
];
const data = [
  {
    key: "1",
    name: "Harshit Kumar",
    designation: "Web Developer",
    status: `Active`,
    location: "India",
  },
  {
    key: "2",
    name: "Ishika Jaiswal",
    designation: "Business Manager",
    status: "Active",
    location: "India",
  },
  {
    key: "3",
    name: "Aradhana Shukla",
    designation: "Graphic Designer",
    status: "Active",
    location: "India",
  },
  {
    key: "4",
    name: "Kundan Kumar",
    designation: "Manager",
    status: "Active",
    location: "India",
  },
  {
    key: "5",
    name: "Pawan Kumar",
    designation: "Employee",
    status: "Active",
    location: "India",
  },
];
const columns2 = [
  {
    title: "Index",
    dataIndex: "key",
  },
  {
    title: "Name",
    dataIndex: "name",
  },
  {
    title: "Industries",
    dataIndex: "industries",
  },
  {
    title: "Location",
    dataIndex: "location",
  },
  {
    title: "Website",
    dataIndex: "website",
  },
];
const data2 = [
  {
    key: "1",
    name: "3a Learning Solutions",
    industries: "Training",
    location: "India",
    website: "www.3alearningsolutions.com",
  },
  {
    key: "2",
    name: "Campus Sutras Pvt. Ltd",
    industries: "Training",
    location: "India",
    website: "www.campussutras.com",
  },
  {
    key: "3",
    name: "Infosis",
    industries: "Software",
    location: "India",
    website: "www.infosys.com",
  },
  {
    key: "4",
    name: "3a Learning Solutions",
    industries: "Training",
    location: "India",
    website: "www.3alearningsolutions.com",
  },
  {
    key: "5",
    name: "3a Learning Solutions",
    industries: "Training",
    location: "India",
    website: "www.3alearningsolutions.com",
  },
];

const page = () => {
  return (
    <>
      <main className="adminDashboard width100 flex flexColumn">
        <section className="adminTabsOne flex width100 alignStart">
          <div className="adminTabsOneChild dashUsers flex spaceBtw">
            <div className="adminTabsOneChildContent  width50">
              <h2>5</h2>
              <p>Users</p>
            </div>
            <div className="adminTabsOneChildImage width50 flex">
              <Image src={usersImage} alt="" />
            </div>
          </div>
          <div className="adminTabsOneChild dashAccounts flex spaceBtw">
            <div className="adminTabsOneChildContent width50">
              <h2>8</h2>
              <p>Accounts</p>
            </div>
            <div className="adminTabsOneChildImage width50 flex">
              <Image src={accountsImage} alt="" />
            </div>
          </div>
          <div className="adminTabsOneChild dashNotes flex spaceBtw ">
            <div className="adminTabsOneChildContent width50">
              <h2>12</h2>
              <p>Notes</p>
            </div>
            <div className="adminTabsOneChildImage width50 flex">
              <Image src={todosImage} alt="" />
            </div>
          </div>
        </section>
        <section className="adminTabsthree flex width alignStart width100">
          <div
            className="adminTabsThreeChild flex spaceBtw"
            style={{ background: "var(--borderColor)" }}
          >
            <h3>Create User</h3>
            <RiAddFill style={{ marginBottom: "-3px", fontSize: "1.5rem" }} />
          </div>
          <div
            className="adminTabsThreeChild flex spaceBtw"
            style={{ background: "var(--borderColor)" }}
          >
            <h3>Create Account</h3>
            <RiAddFill style={{ marginBottom: "-3px", fontSize: "1.5rem" }} />
          </div>
          <div
            className="adminTabsThreeChild flex spaceBtw"
            style={{ background: "var(--borderColor)" }}
          >
            <h3>Create Note</h3>
            <RiAddFill style={{ marginBottom: "-3px", fontSize: "1.5rem" }} />
          </div>
          <div
            className="adminTabsThreeChild flex spaceBtw"
            style={{ background: "var(--borderColor)" }}
          >
            <h3>Settings</h3>
            <RiSettings3Line
              style={{ marginBottom: "-3px", fontSize: "1.5rem" }}
            />
          </div>
          <div
            className="adminTabsThreeChild flex spaceBtw"
            style={{ background: "var(--borderColor)" }}
          >
            <h3>My Profile</h3>
            <RiProfileLine
              style={{ marginBottom: "-3px", fontSize: "1.5rem" }}
            />
          </div>
        </section>
        <section className="adminTabsTwo flex width100 alignStart">
          <div className="adminTabsTwoChild">
            <h2 style={{ marginBottom: "1rem" }}>
              Recent Users <RiArrowDownLine style={{ marginBottom: "-4px" }} />
            </h2>
            <Table
              columns={columns}
              dataSource={data}
              size="middle"
              pagination={false}
              style={{ marginBottom: "1rem" }}
            />
            <CommonBtn text="All Users" link="/admin/dashboard/users" />
          </div>
          <div className="adminTabsTwoChild">
            <h2 style={{ marginBottom: "1rem" }}>
              Recent Accounts{" "}
              <RiArrowDownLine style={{ marginBottom: "-4px" }} />
            </h2>
            <Table
              columns={columns2}
              dataSource={data2}
              size="middle"
              pagination={false}
              style={{ marginBottom: "1rem" }}
            />
            <CommonBtn text="All Accounts" link="/admin/dashboard/accounts" />
          </div>
        </section>
      </main>
    </>
  );
};

export default page;
