import CartProduct from "@/Components/CartProduct";
import Authenticated from "@/Layout/AuthenticatedLayout";
import { useState } from "react";
import React, { Component } from "react";
import CreateDonation from "../Donation/Create";

export default function Cart() {
  const [selectedBooks, showSelectedBooks] = useState(false);
  const [activePage, setActivePage] = useState<string>("Cart");

  const handleChangePage = (title: string) => {
    setActivePage(title);
  };

  return (
    <Authenticated>
      <div
        id="cart"
        className="text-white px-8 w-full h-full items-start py-4 flex flex-row justify-start gap-8"
      >
        {/* <div className="w-full h-full flex-col flex items-start justify-start gap-8">
                    <div className="w-full h-full rounded-xl flex flex-col items-start justify-start gap-2">

                        <h1>
                            Cart
                        </h1>
                        <div className="w-full bg-primary-fg h-full rounded-xl flex flex-col items-start justify-start gap-2">
                            <CartProduct />
                        </div>
                    </div>
                 
                    
                </div>
                <div className="w-1/2 h-full flex-col flex items-start justify-start">
                    <div className="w-full h-4/6 rounded-xl flex flex-col items-start justify-start gap-2">
                        <h1>
                            Payment
                        </h1>
                        <div className="w-full bg-primary-fg h-3/4 rounded-xl flex flex-row items-start justify-start gap-2">
                        
                        </div>
                    </div>
                    <div className="w-full h-4/6 rounded-xl flex flex-col items-start justify-start gap-2">
                
                    </div>
                    
                </div> */}
      </div>
    </Authenticated>
  );
}
