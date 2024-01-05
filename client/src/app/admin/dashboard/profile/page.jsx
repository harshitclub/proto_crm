import React from "react";
import "./style.css";

const page = () => {
  return (
    <main className="adminProfile width100 flex flexColumn">
      <section className="adminPGeneralInfo width100 flex flexColumn"></section>
      <section className="adminPImportantInfo width100 flex flexColumn"></section>
      <section className="adminPaddressInfo width100 flex flexColumn"></section>
      <section className="adminPSocialInfo width100 flex flexColumn"></section>
    </main>
  );
};

export default page;
