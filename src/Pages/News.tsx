import CardNews from "@/Components/ProgramNews";
import Guest from "@/Layout/GuestLayout";
import { useRef } from "react";

export default function News({ isMoreNews = false }: { isMoreNews?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <Guest>
      <div
        ref={ref}
        id="news"
        className="flex flex-col items-center w-full min-h-screen z-50 justify-start pt-12"
      >
        <h1 className="text-2xl font-bold">Program Yayasan Nurul Hidayah</h1>
        <CardNews isMore={isMoreNews} />
      </div>
    </Guest>
  );
}
