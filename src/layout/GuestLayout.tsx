
import Footer from "@/Components/Footer";
import Navbar from "@/Components/Navbar";
import type { PropsWithChildren } from "react";

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen w-full flex-col bg-primary-bg">
            <Navbar />
            <div className="flex-grow min-h-screen w-full items-center justify-center pt-[60px]">
                {children}
            </div>
            <Footer />
        </div>
    );
}
