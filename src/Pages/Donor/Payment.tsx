import Authenticated from "@/Layout/AuthenticatedLayout";
import { useState } from "react";

export default function Payment() {
  const [selectedBooks, showSelectedBooks] = useState(false);
  const [activePage, setActivePage] = useState<string>("Cart");

  const handleChangePage = (title: string) => {
    setActivePage(title);
  };

  return (
    <Authenticated>
      <div
        id="payment"
        className="flex flex-col w-full items-start justify-end px-8 py-4"
      >
        <h1 className="text-primary-fg self-start flex text-2xl flex-row items-center justify-end font-semibold hover:text-primary-accent">
          Payments
        </h1>
      </div>
    </Authenticated>
  );
}
