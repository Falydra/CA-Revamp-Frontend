import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Settings,
  Users,
  BookOpen,
  Heart,
  TrendingUp,
  FileText,
  Shield,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/Components/ui/sidebar";

import {
  DonorPage,
  DoneePage,
  AdminPage,
  SuperAdminPage,
  type MenuItem as ConfigMenuItem,
} from "@/config/page_data";
import { VersionSwitcher } from "@/Components/version-switcher";

type SidebarGroupConfig = {
  label: string;
  items: ConfigMenuItem[];
};


function getIconForItem(item: ConfigMenuItem): LucideIcon {
  const t = (item.title || "").toLowerCase();
  const u = (item.url || "").toLowerCase();

  if (t.includes("dashboard") || u.endsWith("/dashboard") || u === "/dashboard" || u.includes("/dashboard/")) {
    return Home;
  }
  if (t.includes("profile") || u.includes("/profile")) {
    return Users;
  }
  if (t.includes("riwayat") || t.includes("history") || u.includes("/history")) {
    return TrendingUp;
  }
  if (t.includes("donasi") || t.includes("donation") || t.includes("campaign") || u.includes("/donation") || u.includes("/campaign")) {
    return Heart;
  }
  if (t.includes("buku") || t.includes("book") || u.includes("/book")) {
    return BookOpen;
  }
  if (t.includes("manage") || t.includes("report") || u.includes("/manage") || u.includes("/reports")) {
    return FileText;
  }
  if (t.includes("setting") || u.includes("/settings")) {
    return Settings;
  }
  if (t.includes("application") || t.includes("review") || u.includes("/application")) {
    return Shield;
  }
  if (t.includes("create") || t.includes("buka") || u.includes("/create") || u.includes("/register")) {
    return UserPlus;
  }

  return Home;
}

function getGroupsForRole(role: string): SidebarGroupConfig[] {
  switch (role) {
    case "donor": {
      const mainItems = DonorPage.mainPage.items ?? [];
      const profileItems = (DonorPage.mainPage as any).profileItems ?? [];
      const groups: SidebarGroupConfig[] = [];
      if (mainItems.length) groups.push({ label: "Menu", items: mainItems });
      if (profileItems.length) groups.push({ label: "Profile", items: profileItems });
      return groups;
    }
    case "donee":
      return [{ label: "Menu", items: DoneePage.mainPage.items }];
    case "admin":
      return [{ label: "Menu", items: AdminPage.mainPage.items }];
    case "superadmin":
      return [{ label: "Menu", items: SuperAdminPage.mainPage.items }];
    default:
      return [
        {
          label: "Menu",
          items: [{ title: "Dashboard", url: "/dashboard", isActive: false }],
        },
      ];
  }
}


function isMenuItemActive(currentPath: string, menuUrl: string): boolean {
  
  if (currentPath === menuUrl) {
    return true;
  }

  
  const specialCases = [
    {
      menuUrl: "/dashboard/donor/profile",
      paths: ["/dashboard/donor/profile", "/dashboard/donor/profile/registration"]
    },
    {
      menuUrl: "/dashboard/donor",
      paths: ["/dashboard/donor"]
    },
    {
      menuUrl: "/dashboard/donor/history",
      paths: ["/dashboard/donor/history"]
    }
  ];


  for (const specialCase of specialCases) {
    if (specialCase.menuUrl === menuUrl) {
      return specialCase.paths.includes(currentPath);
    }
  }

 
  return false;
}

interface AppSidebarProps {
  onMenuItemClick: () => void;
}

export function AppSidebar({ onMenuItemClick }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const storedRole = localStorage.getItem("roles");
    if (storedRole) setUserRole(storedRole);
  }, []);

  const groups = useMemo(() => getGroupsForRole(userRole), [userRole]);

  const handleItemClick = (url: string) => {
    navigate(url);
    onMenuItemClick();
  };

  
  const allMenuItems = useMemo(() => {
    const items: Array<ConfigMenuItem & { groupLabel: string }> = [];
    groups.forEach(group => {
      group.items.forEach(item => {
        items.push({ ...item, groupLabel: group.label });
      });
    });
    return items;
  }, [groups]);

  
  const activeMenuUrl = useMemo(() => {
    const currentPath = location.pathname;
    
    
    const sortedItems = [...allMenuItems].sort((a, b) => b.url.length - a.url.length);
    
    
    const activeItem = sortedItems.find(item => isMenuItemActive(currentPath, item.url));
    
    return activeItem?.url || null;
  }, [location.pathname, allMenuItems]);

  return (
    <Sidebar>
      <SidebarContent>
        <VersionSwitcher />

        {groups
          .filter((g) => (g.items?.length ?? 0) > 0)
          .map((group, gi) => (
            <SidebarGroup key={`${group.label}-${gi}`}>
              <SidebarGroupLabel className="text-primary-accent font-bold text-lg rounded-none">
                {group.label === "Menu" ? "CA Revamp" : group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const isActive = activeMenuUrl === item.url;
                    const Icon = getIconForItem(item);

                    return (
                      <SidebarMenuItem key={`${group.label}-${item.url || item.title}`}>
                        <SidebarMenuButton
                          onClick={() => handleItemClick(item.url)}
                          className={`cursor-pointer ${
                            isActive
                              ? "bg-primary-accent text-white hover:bg-primary-accent/80"
                              : "hover:bg-primary-accent/10"
                          }`}
                        >
                          <Icon />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
      </SidebarContent>
    </Sidebar>
  );
}