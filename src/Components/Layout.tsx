import React from "react";


interface LayoutProps {
  children: React.ReactNode;
  description?: string;
  pageTitle?: string;
  className?: string;
}

export default function Layout({
  children,
 
  className = "",
}: LayoutProps) {
  return (
    <div className={`overflow-y-hidden ${className} bg-gradient-to-br from-indigo-50 via-white to-blue-100`}>
     

     
      <main className="min-h-screen">{children}</main>
      
    </div>
  );
}
