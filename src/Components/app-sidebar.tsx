import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Settings,
  BookOpen,
  Heart,
  FileText,
  Shield,
  UserPlus,
  FolderOpen,
  PlusSquare,
  History,
  User,
  UsersRound,
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
  OrganizerPage,
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

  // Dashboard
  if (t.includes("dashboard")) {
    return Home;
  }
  
  // Profile (single user)
  if (t.includes("profile")) {
    return User;
  }
  
  // Donation History (history with time)
  if (t.includes("history")) {
    return History;
  }
  
  // My Donations (folder/file icon)
  if (t.includes("my donation")) {
    return FolderOpen;
  }
  
  // New Campaign (plus square for new)
  if (t.includes("new campaign") || t.includes("create")) {
    return PlusSquare;
  }
  
  // Organizer Registration
  if (t.includes("registration")) {
    return UserPlus;
  }
  
  // Manage Admins / Manage Users (multiple users)
  if (t.includes("manage admin") || t.includes("manage user")) {
    return UsersRound;
  }
  
  // Other Manage pages
  if (t.includes("manage")) {
    return FileText;
  }
  
  // Donations/Campaigns
  if (t.includes("donation") || t.includes("campaign")) {
    return Heart;
  }
  
  // Books
  if (t.includes("book")) {
    return BookOpen;
  }
  
  // Applications
  if (t.includes("application")) {
    return Shield;
  }
  
  // Settings
  if (t.includes("setting")) {
    return Settings;
  }

  // Default fallback
  return Home;
}

function getGroupsForRole(roles: string[]): SidebarGroupConfig[] {
  

  if (roles.includes("superadmin")) {
    return [{ label: "Menu", items: SuperAdminPage.mainPage.items }];
  } else if (roles.includes("admin")) {
    return [{ label: "Menu", items: AdminPage.mainPage.items }];
  } else if (roles.includes("organizer")) {
    return [{ label: "Menu", items: OrganizerPage.mainPage.items }];
  } else if (roles.includes("donor")) {
    const mainItems = DonorPage.mainPage.items ?? [];
    const profileItems = (DonorPage.mainPage as any).profileItems ?? [];
    // Merge both main and profile items into a single "Menu" group
    const allItems = [...mainItems, ...profileItems];
    return [{ label: "Menu", items: allItems }];
  } 

  return [
    {
      label: "Menu",
      items: [{ title: "Dashboard", url: "/dashboard", isActive: false }],
    },
  ];
}


function isMenuItemActive(currentPath: string, menuUrl: string): boolean {

  if (currentPath === menuUrl) {
    return true;
  }

  // Special handling for review-donations page - should highlight "My Donations"
  if (currentPath.includes('/review-donations') && menuUrl === '/dashboard/organizer/donations') {
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
  const [userRole, setUserRole] = useState<string[]>([]);

  useEffect(() => {
    const storedRole = localStorage.getItem("roles")
      ? JSON.parse(localStorage.getItem("roles") || "[]")
      : [];
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
              <SidebarGroupLabel className="text-black font-bold text-lg rounded-none">
                {group.label === "Menu" ? "Menu" : group.label}
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
                          className={`cursor-pointer ${isActive
                            ? "bg-primary-bg text-white hover:bg-primary-bg hover:text-white "
                            : "hover:bg-primary-bg/10"
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