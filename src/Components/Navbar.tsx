import { Link, useLocation, useNavigate } from "react-router-dom";
import { IoPersonOutline } from "react-icons/io5";
import { FaHome } from "react-icons/fa";
import { IoIosLogOut } from "react-icons/io";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Button } from "@/Components/ui/button";
import axios from "axios";

interface User {
  name?: string;
  email?: string;
  role?: string;
}

interface NavbarProps {
  auth: {
    roles: string[];
    user?: User;
  };
}

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const auth: NavbarProps["auth"] = {
    roles: localStorage.getItem("roles")
      ? JSON.parse(localStorage.getItem("roles") || "[]")
      : [],
    user: localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : undefined,
  };

  const currentPath = location.pathname;
 
  const getDashboardUrl = (roles: string[]) => {
    if (roles.includes("superadmin")) {
      return "/dashboard/super-admin";
    } else if (roles.includes("admin")) {
      return "/dashboard/admin";
    } else if (roles.includes("organizer")) {
      return "/dashboard/organizer";
    } else if (roles.includes("donor")) {
      return "/dashboard/donor";
    } else {
      return "/";
    }
  };

  const dashboardUrl = getDashboardUrl(auth.roles);

  const isActiveUrl = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/logout`,
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
     
      localStorage.removeItem("user");
      localStorage.removeItem("roles");
      localStorage.removeItem("auth_token");
      navigate("/auth/login");
      
    }
  };

  return (
    <div className="w-full fixed h-[80px] top-0 left-0 z-20">
      <div className="flex w-full h-[80px] backdrop-blur-sm z-15 text-primary-bg items-center justify-center top-0 left-0 sticky">
        <div className="flex w-full h-full items-center justify-center">
          <div className="flex w-full items-center justify-start flex-row px-8">
            <Link to="/" className="flex items-center justify-start flex-row">
              <img src="/images/LogoYayasan.png" className="w-auto flex h-12" />
            </Link>
          </div>

          <div className="flex w-full items-center justify-around">
            <Link
              to="/"
              className={`hover:text-primary-accent px-4 py-2 ${
                isActiveUrl("/")
                  ? "border-b-4 border-blue-500 text-blue-500"
                  : "text-muted-foreground"
              }`}
            >
              Home
            </Link>
            <Link
              to="/news"
              className={`hover:text-primary-accent px-4 py-2 ${
                isActiveUrl("/news")
                  ? "border-b-4 border-blue-500 text-blue-500"
                  : "text-muted-foreground"
              }`}
            >
              News
            </Link>
            <Link
              to="/campaigns"
              className={`hover:text-primary-accent px-4 py-2 ${
                isActiveUrl("/campaigns")
                  ? "border-b-4 border-blue-500 text-blue-500"
                  : "text-muted-foreground"
              }`}
            >
              Campaigns
            </Link>
          </div>

          {!auth.user ? (
            <div className="flex w-full items-end justify-end px-4">
              <Link
                to="/auth/login"
                className="items-center justify-center mr-3 hover:bg-blue-100 rounded-md transition-all duration-300 w-1/3 h-[50px] text-center flex hover:text-blue-500 cursor-pointer"
              >
                Login
              </Link>
            </div>
          ) : (
            <div className="flex w-full items-end justify-end px-4 overflow-y-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="w-full h-full">
                  <Button
                    className="w-12 h-12 aspect-square rounded-full bg-primary-fg border border-primary-bg hover:bg-primary-bg focus:outline-none"
                    tabIndex={0}
                    type="button"
                  >
                    <IoPersonOutline className="w-6 h-6 text-primary-bg" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 mr-4 overflow-y-auto">
                  <DropdownMenuLabel>
                    {auth.user.name || "Account"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <Link
                      to={dashboardUrl}
                      className="flex justify-between w-full h-8 items-center bg-transparent hover:bg-muted-foreground/20 rounded-md text-primary-bg px-2 font-semibold text-sm"
                    >
                      Dashboard
                      <FaHome className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex justify-between w-full h-8 items-center bg-transparent hover:bg-muted-foreground/20 rounded-md text-primary-bg px-2 font-semibold text-sm"
                    >
                      Logout
                      <IoIosLogOut className="w-4 h-4" />
                    </button>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}