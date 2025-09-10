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
        className="text-white w-full h-2/5 items-start py-4 flex flex-col justify-start gap-2"
      >
        Payment
      </div>
    </Authenticated>
  );
}
