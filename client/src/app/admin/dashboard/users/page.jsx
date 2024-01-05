"use client";
import React from "react";
import { useMemo, useState, useEffect } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { ViewProfile } from "@/components/local/Buttons/Buttons";

const data = [
  {
    index: 1,
    name: "Harshit Kumar",
    email: "harshitclub@gmail.com",
    phone: 7505394360,
    designation: "Web Developer",
    location: "India",
    accounts: 5,
    status: "Active",
    profile: <ViewProfile text="View" />,
  },
  {
    index: 2,
    name: "Harshit Kumar",
    email: "harshitclub@gmail.com",
    phone: 7505394360,
    designation: "Web Developer",
    location: "India",
    accounts: 5,
    status: "Active",
    profile: <ViewProfile text="View" />,
  },
  {
    index: 3,
    name: "Harshit Kumar",
    email: "harshitclub@gmail.com",
    phone: 7505394360,
    designation: "Web Developer",
    location: "India",
    accounts: 5,
    status: "Active",
    profile: <ViewProfile text="View" />,
  },
  {
    index: 4,
    name: "Harshit Kumar",
    email: "harshitclub@gmail.com",
    phone: 7505394360,
    designation: "Web Developer",
    location: "India",
    accounts: 5,
    status: "Active",
    profile: <ViewProfile text="View" />,
  },
  {
    index: 5,
    name: "Harshit Kumar",
    email: "harshitclub@gmail.com",
    phone: 7505394360,
    designation: "Web Developer",
    location: "India",
    accounts: 5,
    status: "Active",
    profile: <ViewProfile text="View" />,
  },
  {
    index: 6,
    name: "Harshit Kumar",
    email: "harshitclub@gmail.com",
    phone: 7505394360,
    designation: "Web Developer",
    location: "India",
    accounts: 5,
    status: "Active",
    profile: <ViewProfile text="View" />,
  },
  {
    index: 7,
    name: "Harshit Kumar",
    email: "harshitclub@gmail.com",
    phone: 7505394360,
    designation: "Web Developer",
    location: "India",
    accounts: 5,
    status: "Active",
    profile: <ViewProfile text="View" />,
  },
  {
    index: 8,
    name: "Harshit Kumar",
    email: "harshitclub@gmail.com",
    phone: 7505394360,
    designation: "Web Developer",
    location: "India",
    accounts: 5,
    status: "Active",
    profile: <ViewProfile text="View" />,
  },
];

const page = () => {
  //should be memoized or stable
  const columns = useMemo(
    () => [
      {
        accessorKey: "index", //access nested data with dot notation
        header: "Index",
        size: 100,
      },
      {
        accessorKey: "name", //access nested data with dot notation
        header: "Name",
        size: 150,
      },
      {
        accessorKey: "email",
        header: "Email",
        size: 150,
      },
      {
        accessorKey: "phone", //normal accessorKey
        header: "Phone",
        size: 200,
      },
      {
        accessorKey: "designation",
        header: "Designation",
        size: 150,
      },
      {
        accessorKey: "location",
        header: "Location",
        size: 150,
      },
      {
        accessorKey: "accounts",
        header: "Assigned Accounts",
        size: 150,
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 150,
      },
      {
        accessorKey: "profile",
        header: "Profile",
        size: 150,
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
  });

  return (
    <>
      <main className="adminUsers flex width100 flexColumn">
        <div className="adminUsersTable width100">
          <MaterialReactTable table={table} />
        </div>
      </main>
    </>
  );
};

export default page;
