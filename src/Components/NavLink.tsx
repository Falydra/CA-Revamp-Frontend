import { NavLink as RouterNavLink, type NavLinkProps } from "react-router-dom";
import React from "react";

interface Props extends NavLinkProps {
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function NavLink({ active = false, className = '', children, ...props }: Props) {
  return (
    <RouterNavLink
      {...props}
      className={({ isActive }) =>
        [
          "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none",
          isActive || active
            ? "border-indigo-400 text-gray-900 focus:border-indigo-700"
            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 focus:border-gray-300 focus:text-gray-700",
          className
        ].join(" ")
      }
    >
      {children}
    </RouterNavLink>
  );
}
