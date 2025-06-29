import Footer from "@/Components/Footer";
import Navbar from "@/Components/Navbar";
import type { PropsWithChildren } from "react";
import { useMemo } from "react";

function getRandom(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function getRandomColor() {
  const colors = ["bg-blue-100", "bg-blue-300", "bg-blue-500"];
  return colors[Math.floor(Math.random() * colors.length)];
}

export default function Guest({ children }: PropsWithChildren) {
  const bubbles = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => ({
        left: `${getRandom(0, 100)}%`,
        top: `${getRandom(0, 100)}%`,
        right: `${getRandom(0, 100)}%`,
        bottom: `${getRandom(0, 100)}%`,
        size: getRandom(40, 200),
        opacity: getRandom(0.15, 0.4),
        blur: getRandom(0, 8),
        color: getRandomColor(),
        key: i,
      })),
    []
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br overflow-x-hidden from-indigo-50 via-white to-blue-100">
      <Navbar />
      {bubbles.map((b) => (
        <div
          key={b.key}
          style={{
            left: b.left,
            top: b.top,
            width: b.size,
            height: b.size,
            opacity: b.opacity,
            filter: `blur(${b.blur}px)`,
          }}
          className={`absolute rounded-full ${b.color} pointer-events-none`}
        />
      ))}
      <div className="flex-grow min-h-screen w-full items-center justify-center pt-[60px]">
        {children}
      </div>
      <Footer />
    </div>
  );
}
