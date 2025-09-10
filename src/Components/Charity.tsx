import { useState } from "react";
import { Link } from "react-scroll";
import { CardWithForm } from "@/Components/CharityCard";
import { BookCharityCard } from "@/Components/BookDonationCard";
import { motion, AnimatePresence } from "framer-motion";
// import CharityNews from "./CharityNews";

export default function Charity() {
  const [isMoney, setIsMoney] = useState(true);
  const [isBook, setIsBook] = useState(false);

  const charityToggle = isMoney ? "charity" : "book";

  console.log("charityToggle", charityToggle);

  return (
    <div
      id="charity"
      className="w-full min-h-screen flex justify-center items-center"
    >
      <section className="w-full h-full flex flex-col items-center justify-start py-16 px-4 relative overflow-hidden">
        <div className="transform w-2/12 top-0 items-center justify-center flex flex-col">
          <div className="relative w-full flex items-center justify-center px-1 py-1 bg-gray-700 border border-gray-600 rounded-full">
            <div
              className={`absolute top-0 left-0 h-full rounded-3xl w-1/2 bg-gradient-to-t from-gray-600 to-transparent shadow-[0_0_10px_3px_rgba(255,255,255,0.3)] transition-transform duration-300 ease-in-out ${
                isMoney
                  ? "translate-x-0 bg-gradient-to-t from-gray-400 z-12 to-transparent"
                  : "translate-x-full bg-gradient-to-t from-gray-400 z-12 to-transparent"
              }`}
            />

            <Link
              to="money-charity"
              smooth
              delay={100}
              className="relative w-full py-1 h-9 flex items-center justify-center rounded-full transition-all duration-300 ease-in-out text-sm font-bold text-white cursor-pointer"
              onClick={() => {
                setIsMoney(true);
                setIsBook(false);
              }}
            >
              Charity
            </Link>

            <Link
              to="book-charity"
              smooth
              delay={100}
              className="relative w-full py-1 h-9 flex items-center justify-center rounded-full transition-all duration-300 ease-in-out text-sm font-bold text-white cursor-pointer"
              onClick={() => {
                setIsMoney(false);
                setIsBook(true);
              }}
            >
              Book Donation
            </Link>
          </div>
        </div>

        <div className="relative w-full h-screen flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isMoney && (
              <motion.div
                key="money"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full flex flex-col items-center justify-start py-4"
              >
                <h1 className="text-2xl font-bold text-primary-fg">
                  Berita Terkini
                </h1>

                <CardWithForm />
              </motion.div>
            )}

            {isBook && (
              <motion.div
                key="book"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full flex flex-col items-center justify-start py-4"
              >
                <h1 className="text-2xl font-bold text-primary-fg ">
                  Berita Terkini
                </h1>
                <div className="w-full flex justify-center">
                  <BookCharityCard />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
