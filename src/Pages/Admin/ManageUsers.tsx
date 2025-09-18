import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/Layout/AuthenticatedLayout";
import { apiService } from "@/services/api";
import type { User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";
import { toast } from "sonner";
import {
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [perPage] = useState(10);

  const fetchUsers = async (page = 1, search?: string) => {
  try {
    const response = await apiService.admin.getUsers(page, perPage);
    

    const payload = response?.success ? response.data : response;

    
    if (payload && (Array.isArray(payload.data) || payload.data === undefined)) {
     
      const usersArray = Array.isArray(payload.data) ? payload.data : (Array.isArray(payload) ? payload : []);
      setUsers(usersArray || []);
      setTotalPages(payload.last_page ?? (payload.meta?.last_page ?? 1));
      setCurrentPage(payload.current_page ?? (payload.meta?.current_page ?? page));
      setTotalUsers(payload.total ?? (payload.meta?.total ?? usersArray.length));
    } else {
      setUsers([]);
      toast.error("Failed to load users");
    }
  } catch (error: any) {
    console.error("Error fetching users:", error);
    if (error?.response?.status === 403) {
      toast.error("Access denied. Admin privileges required.");
    } else {
      toast.error("Failed to load users");
    }
    setUsers([]);
  }
};


  useEffect(() => {
    fetchUsers(1);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim() !== "") {
        fetchUsers(1, searchTerm);
      } else {
        fetchUsers(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await apiService.admin.deleteUser(userId);
      toast.success("User deleted successfully");
      fetchUsers(currentPage, searchTerm);
    } catch (error: any) {
      console.error("Error deleting user:", error);
      if (error?.response?.status === 403) {
        toast.error("You don't have permission to delete this user");
      } else if (error?.response?.status === 400) {
        toast.error(error.response.data.message || "Cannot delete this user");
      } else {
        toast.error("Failed to delete user");
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUsers(page, searchTerm);
  };

  const getUserRoleDisplay = (user: User) => {
    if (user.roles && user.roles.length > 0) {
      return user.roles.map((role) => role.name).join(", ");
    }
    return user.role || "User";
  };

  const getRoleBadgeColor = (role: string) => {
    const normalizedRole = role.toLowerCase();
    switch (normalizedRole) {
      case "superadmin":
        return "bg-red-100 text-red-800";
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "donee":
      case "organizer":
        return "bg-green-100 text-green-800";
      case "donor":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  console.log(users);

  return (
    <AdminLayout>
      <div className="space-y-6 w-full p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Manage Users</h1>
            <p className="text-muted-foreground">
              View and manage all platform users ({totalUsers} total)
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, email, or user ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => fetchUsers(1, searchTerm)}
                variant="outline"
              >
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Users ({users.length} showing)</CardTitle>
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "No users found matching your search"
                    : "No users found"}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user, index) => (
                        <TableRow key={user.user_id}>
                          <TableCell className="font-medium">
                            {(currentPage - 1) * perPage + index + 1}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">
                                ID: {user.user_id}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge
                              className={getRoleBadgeColor(
                                getUserRoleDisplay(user)
                              )}
                            >
                              {getUserRoleDisplay(user)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.created_at
                              ? new Date(user.created_at).toLocaleDateString()
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                user.email_verified_at
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {user.email_verified_at
                                ? "Verified"
                                : "Unverified"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link
                                    to={`/dashboard/admin/edit-user/${user.user_id}`}
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit User
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteUser(user.user_id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {(currentPage - 1) * perPage + 1}-
                      {Math.min(currentPage * perPage, totalUsers)} of{" "}
                      {totalUsers} users
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
