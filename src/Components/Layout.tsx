import React from "react";
import { Helmet } from "react-helmet"

interface LayoutProps {
  children: React.ReactNode;
  description?: string;
  pageTitle?: string;
  className?: string;
}

export default function Layout({
  children,
  description,
  pageTitle = "Caritas Aeterna",
  className = "",
}: LayoutProps) {
  return (
    <div className={`overflow-y-hidden ${className} bg-gradient-to-br from-indigo-50 via-white to-blue-100`}>
      <Helmet>
        <title>{pageTitle}</title>
        {description && <meta name="description" content={description} />}
      </Helmet>

     
      <main className="min-h-screen">{children}</main>
      
    </div>
  );
}
