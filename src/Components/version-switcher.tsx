import * as React from "react";
import { IoPersonOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/Components/ui/sidebar";

type LocalUser = {
  name?: string;
  username?: string;
  email?: string;
};

export function VersionSwitcher() {
  const [user, setUser] = React.useState<LocalUser | null>(null);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed);
      }
    } catch {
      setUser(null);
    }
  }, []);

  const displayName =
    user?.name || user?.username || "User";
  const email = user?.email || "-";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="h-16 border-b border-border">
          <Link to="/" className="block h-full">
            <SidebarMenuButton
            
             className="h-full w-full rounded-none px-3 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary-bg text-sidebar-primary-foreground">
                <IoPersonOutline />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">{displayName}</span>
                <span className="text-xs opacity-80">{email}</span>
              </div>
            </SidebarMenuButton>
          </Link>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}