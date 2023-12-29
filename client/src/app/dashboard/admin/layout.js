"use client";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
export default function AdminDashboardLayout({ children }) {
  return (
    <main className="flex width100">
      <Sidebar>
        <Menu>
          <MenuItem> Pie charts </MenuItem>
          <MenuItem> Line charts </MenuItem>

          <MenuItem> Documentation </MenuItem>
          <MenuItem> Calendar </MenuItem>
        </Menu>
      </Sidebar>
      <section>{children}</section>
    </main>
  );
}
