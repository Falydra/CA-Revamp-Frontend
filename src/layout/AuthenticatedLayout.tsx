import  { type PropsWithChildren, type ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AppSidebar } from "@/Components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb";
import { Separator } from "@/Components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/Components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Button } from "@/Components/ui/button";
import { IoIosLogOut } from "react-icons/io";
import { FaHome } from "react-icons/fa";
import { apiService } from "@/services/api";
import { DonorPage, DoneePage, AdminPage, SuperAdminPage } from "@/config/page_data";
import { IoPersonOutline } from "react-icons/io5";

interface User {
    user_id: string;
    name: string;
    email: string;
    role?: string;
}

interface AuthProps {
    user: User | null;
    roles: string;
}

export default function Authenticated({
    header,
    children,
    rightSidebarChildren,
}: PropsWithChildren<{ header?: ReactNode, rightSidebarChildren?: ReactNode }>) {
    const location = useLocation();
    const navigate = useNavigate();
    const [auth, setAuth] = useState<AuthProps>({ user: null, roles: "" });
    const [loading, setLoading] = useState(true);

    
    useEffect(() => {
        const getCurrentUser = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                const storedRoles = localStorage.getItem('roles');
                const storedToken = localStorage.getItem('auth_token');
                
                if (storedUser && storedRoles && storedToken) {
                    const parsedUser = JSON.parse(storedUser);
                    setAuth({
                        user: parsedUser,
                        roles: storedRoles
                    });
                } else {
                   
                    navigate('/auth/login');
                    return;
                }
            } catch (error) {
                console.error('Error getting current user:', error);
                
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user');
                localStorage.removeItem('roles');
                navigate('/auth/login');
            } finally {
                setLoading(false);
            }
        };

        getCurrentUser();
    }, [navigate]);

    
    const handleLogout = async () => {
        try {
            await apiService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
          
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            localStorage.removeItem('roles');
            navigate('/');
        }
    };

 
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }


    if (!auth.user) {
        return null;
    }

    
    const currentPath = location.pathname;
    console.log("Roles:", auth.roles);

   
    const getMenuItems = (role: string) => {
        switch (role) {
            case "donee":
                return DoneePage.mainPage.items;
            case "donor":
                return DonorPage.mainPage.items;
            case "admin":
                return AdminPage.mainPage.items;
            case "superadmin":
                return SuperAdminPage.mainPage.items;
            default:
                return [];
        }
    };

    const menuItems = getMenuItems(auth.roles);

    
    const activeMenuItem = menuItems
        .filter(item => currentPath.startsWith(item.url))
        .sort((a, b) => b.url.length - a.url.length)[0];

    
    const getDashboardUrl = (role: string) => {
        switch (role) {
            case "superadmin":
                return "/dashboard/super-admin";
            case "admin":
                return "/dashboard/admin";
            case "donor":
                return "/dashboard/donor";
            case "donee":
                return "/dashboard/donee";
            default:
                return "/dashboard";
        }
    };

    const dashboardUrl = getDashboardUrl(auth.roles);

    return (
        <SidebarProvider>
            <AppSidebar onMenuItemClick={() => {}} />
            <SidebarInset>
                <div className="flex flex-col items-start justify-start w-full h-full bg-primary-fg">
                    <header className="flex h-16 w-full items-center justify-between gap-2 border-b px-4">
                        <div className="flex flex-row w-full items-center justify-start">
                            <SidebarTrigger className="-ml-1" />
                            <Separator orientation="vertical" className="mr-2 h-4 opacity-50" />
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem className="hidden md:block">
                                        <BreadcrumbLink asChild>
                                            <Link to={dashboardUrl} className="text-black">
                                                Dashboard
                                            </Link>
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    {activeMenuItem && (
                                        <>
                                            <BreadcrumbSeparator className="hidden md:block" />
                                            <BreadcrumbItem>
                                                <BreadcrumbPage className="hover:text-primary-accent text-black cursor-pointer">
                                                    {activeMenuItem.title}
                                                </BreadcrumbPage>
                                            </BreadcrumbItem>
                                        </>
                                    )}
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                        
                        <div className="flex flex-row items-center justify-center">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild className="w-full h-full">
                                    <Button className="w-10 h-10 aspect-square rounded-full p-1 bg-primary-fg border items-center flex border-primary-bg">
                                        <IoPersonOutline className="w-6 h-6 text-primary-bg " />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-48">
                                    <DropdownMenuLabel>
                                        {auth.user.name}
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <Link 
                                            to="/" 
                                            className="flex justify-between w-full h-8 items-center bg-transparent hover:bg-muted-foreground/20 rounded-md text-primary-bg px-2 font-semibold text-sm"
                                        >
                                            Home
                                            <FaHome className="w-4 h-4 aspect-square self-center" />
                                        </Link>
                                        <button 
                                            onClick={handleLogout}
                                            className="flex justify-between w-full h-8 items-center bg-transparent hover:bg-muted-foreground/20 rounded-md text-primary-bg px-2 font-semibold text-sm"
                                        >
                                            Logout
                                            <IoIosLogOut className="w-4 h-4 aspect-square self-center" />
                                        </button>
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>
                    {children}
                </div>
                {rightSidebarChildren}
            </SidebarInset>
        </SidebarProvider>
    );
}