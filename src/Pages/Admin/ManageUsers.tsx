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
import { Search, Edit, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const response = await apiService.admin.getUsers(page, 10);

      if (response.success) {
        const userList = Array.isArray(response.data.data)
          ? response.data.data
          : Array.isArray(response.data)
          ? response.data
          : [];

        setUsers(userList);
        setFilteredUsers(userList);
        setTotalPages(response.data.last_page || 1);
        setCurrentPage(response.data.current_page || 1);
      } else {
        setUsers([]);
        setFilteredUsers([]);
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      if (error?.response?.status === 403) {
        toast.error("Access denied. Admin privileges required.");
      } else {
        toast.error("Failed to load users");
      }
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await apiService.admin.deleteUser(userId);
      toast.success("User deleted successfully");
      fetchUsers(currentPage);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page);
  };

  const getUserRoleDisplay = (user: User) => {
    if (user.roles && user.roles.length > 0) {
      return user.roles.map((role) => role.name).join(", ");
    }
    return user.role || "User";
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "superadmin":
        return "bg-red-100 text-red-800";
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "donee":
        return "bg-green-100 text-green-800";
      case "donor":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading users...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Manage Users</h1>
            <p className="text-muted-foreground">
              View and manage all platform users
            </p>
          </div>
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
              <Button onClick={() => fetchUsers(1)} variant="outline">
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="hidden md:block">
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                            User
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                            Email
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                            Role
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                            Joined
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                            Status
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredUsers.map((user) => (
                          <tr key={user.user_id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-gray-500">
                                  ID: {user.user_id}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">{user.email}</td>
                            <td className="px-4 py-3">
                              <Badge
                                className={getRoleBadgeColor(
                                  getUserRoleDisplay(user)
                                )}
                              >
                                {getUserRoleDisplay(user)}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {user.created_at
                                ? new Date(user.created_at).toLocaleDateString()
                                : "N/A"}
                            </td>
                            <td className="px-4 py-3">
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
                            </td>
                            <td className="px-4 py-3 text-right">
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
                                    onClick={() =>
                                      handleDeleteUser(user.user_id)
                                    }
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="md:hidden space-y-4">
                  {filteredUsers.map((user) => (
                    <Card key={user.user_id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium">{user.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ID: {user.user_id}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge
                                className={getRoleBadgeColor(
                                  getUserRoleDisplay(user)
                                )}
                              >
                                {getUserRoleDisplay(user)}
                              </Badge>
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
                            </div>
                          </div>
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
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
