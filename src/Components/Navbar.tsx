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
  role: string;
}

interface NavbarProps {
  auth: {
    roles: string;
    user?: User;
  };
}

export default function Navbar() {
  const location = useLocation();
    const auth: NavbarProps["auth"] = {
    roles: localStorage.getItem("roles") || "",
    user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "{}") : undefined,
    };
  const navigate = useNavigate();

  const currentPath = location.pathname;

  const dashboardIdentifier =
    auth.roles === "superadmin"
      ? "/dashboard/super-admin"
      : auth.roles === "admin"
      ? "/dashboard/admin"
      : auth.roles === "donor"
      ? "/dashboard/donor"
      : auth.roles === "donee"
      ? "/dashboard/donee"
      : "/";

  const isActiveUrl = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/logout`, {}, { withCredentials: true });
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="w-full fixed h-[80px] bg-primary-fg top-0 left-0 z-20">
      <div className="flex-row flex w-full h-[80px] backdrop-blur-sm z-15 text-primary-bg items-center justify-center top-0 left-0 sticky">
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
                isActiveUrl("/") ? "border-b-4 border-blue-500 text-blue-500" : ""
              }`}
            >
              Home
            </Link>
            <Link
              to="/news"
              className={`hover:text-primary-accent px-4 py-2 ${
                isActiveUrl("/news") ? "border-b-4 border-primary-bg" : ""
              }`}
            >
              News
            </Link>
            <Link
              to="/donation"
              className={`hover:text-primary-accent px-4 py-2 ${
                isActiveUrl("/donation") ? "border-b-4 border-primary-bg" : ""
              }`}
            >
              Donation
            </Link>
          </div>

          
          {!auth.user ? (
            <div className="flex w-full items-end justify-end px-4">
              <Link
                
                to="/auth/login"
                className="items-center justify-center mr-3 bg-primary-bg w-1/3 h-[50px] text-center flex text-primary-fg hover:text-primary-fg/100 cursor-pointer"
              >
                Login
              </Link>
            </div>
          ) : (
            <div className="flex w-full items-end justify-end px-4 overflow-y-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="w-full h-full">
                  <Button
                    className="w-12 h-12 aspect-square rounded-full bg-primary-bg hover:bg-primary-bg focus:outline-none"
                    tabIndex={0}
                    type="button"
                  >
                    <IoPersonOutline className="w-6 h-6 text-primary-fg" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 mr-4 overflow-y-auto">
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <Link
                      to={dashboardIdentifier}
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
