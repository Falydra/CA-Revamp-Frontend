import CartProduct from "@/Components/CartProduct";
import Authenticated from "@/Layout/AuthenticatedLayout";
import { useState } from "react";
import React, { Component } from "react";
import CreateDonation from "../Donation/Create";
import axios from "axios";

export default function DoneeCreateDonation() {
  const [activePage, setActivePage] = useState<string>("Cart");

  const handleChangePage = (title: string) => {
    setActivePage(title);
  };

  axios.get("/api/books");

  return (
    <Authenticated>
      <div
        id="cart"
        className="text-white px-8 w-full h-full items-start py-4 flex flex-row justify-start gap-8"
      >
        <CreateDonation />
      </div>
    </Authenticated>
  );
}
