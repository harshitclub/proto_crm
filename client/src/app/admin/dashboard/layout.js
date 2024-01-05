"use client";
import React, { useState } from "react";
import {
  AccountBookOutlined,
  DashboardOutlined,
  EditOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ProfileOutlined,
  UserOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Button, theme, Avatar, Space } from "antd";
import { Dropdown } from "antd";
import { RiBookReadLine, RiSettings4Fill } from "react-icons/ri";
import Link from "next/link";
import { LogoutBtn } from "@/components/local/Buttons/Buttons";
const items = [
  {
    key: "1",
    label: "Harshit Kumar",
    icon: <UserOutlined />,
    size: "200",
  },
  {
    key: "2",
    label: <Link href="/admin/dashboard">Dashboard</Link>,
    icon: <DashboardOutlined />,
    size: "100",
  },
  {
    key: "3",
    label: <Link href="/admin/dashboard/profile">Profile</Link>,
    icon: <ProfileOutlined />,
    size: "100",
  },
  {
    key: "4",
    label: <Link href="/admin/dashboard/users">Users</Link>,
    icon: <UserSwitchOutlined />,
  },
  {
    key: "5",
    label: <Link href="/admin/dashboard/settings">Settings</Link>,
    icon: <EditOutlined />,
  },
  {
    key: "6",
    danger: true,
    label: "Logout",
    icon: <LogoutOutlined />,
  },
];

const { Header, Sider, Content } = Layout;

export default function AdminDashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <>
      <Layout className="height100vh">
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={{
            background: "#fff",
          }}
        >
          <div className="demo-logo-vertical" />
          <Menu
            style={{
              height: "100%",
            }}
            theme="light"
            mode="inline"
            // defaultSelectedKeys={["1"]}

            items={[
              {
                key: "1",
                icon: <DashboardOutlined />,
                label: <Link href="/admin/dashboard">Dashboard</Link>,
              },
              {
                key: "2",
                icon: <AccountBookOutlined />,
                label: <Link href="/admin/dashboard/accounts">Accounts</Link>,
              },
              {
                key: "3",
                icon: <UserSwitchOutlined />,
                label: <Link href="/admin/dashboard/users">Users</Link>,
              },
              {
                key: "4",
                icon: <ProfileOutlined />,
                label: <Link href="/admin/dashboard/profile">Profile</Link>,
              },
              {
                key: "5",
                icon: <RiBookReadLine />,
                label: <Link href="/admin/dashboard/notes">Notes</Link>,
              },
              {
                key: "6",
                icon: <EditOutlined />,
                label: <Link href="/admin/dashboard/settings">Settings</Link>,
              },
              {
                key: "7",
                icon: <EditOutlined />,
                label: "Logout",
              },
            ]}
          />
        </Sider>
        <Layout>
          <Header
            style={{
              paddingLeft: 12,
              paddingRight: 12,
              background: colorBgContainer,
            }}
            className="flex alignCenter spaceBtw"
          >
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
              }}
            />
            <Space>
              <Dropdown
                menu={{
                  items,
                }}
                size={30}
              >
                <Avatar
                  size={38}
                  icon={<UserOutlined />}
                  onClick={(e) => e.preventDefault()}
                  style={{ cursor: "pointer" }}
                />
              </Dropdown>
              <LogoutBtn />
            </Space>
          </Header>
          <Content
            style={{
              margin: 0,
              padding: 15,
              minHeight: 280,
              background: colorBgContainer,
              // borderRadius: borderRadiusLG,
              borderTop: "1px solid var(--borderColor)",
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </>
  );
}
