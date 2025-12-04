import { useEffect, useState } from "react";
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
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [perPage] = useState(10);
  
  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editData, setEditData] = useState({
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Debug: Check what user is logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedRoles = localStorage.getItem('roles');
    console.log("Current user:", storedUser);
    console.log("Current roles:", storedRoles);
  }, []);

  const fetchUsers = async (page = 1, search?: string) => {
    try {
      const response = await apiService.admin.getUsers(page, perPage, search);
      
      console.log("Raw response:", response);

      const payload = response?.success ? response.data : response;
      
      console.log("Payload:", payload);

      // Handle the response structure from UserCollection
      if (payload && payload.data) {
        const usersArray = Array.isArray(payload.data) ? payload.data : [];
        console.log("Users array:", usersArray);
        
        setUsers(usersArray);
        setTotalPages(payload.last_page ?? 1);
        setCurrentPage(payload.current_page ?? page);
        setTotalUsers(payload.total ?? usersArray.length);
      } else {
        console.error("Invalid payload structure:", payload);
        setUsers([]);
        toast.error("Failed to load users - invalid response structure");
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

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setEditData({
      email: user.email,
      password: "",
      password_confirmation: "",
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
    setEditData({
      email: "",
      password: "",
      password_confirmation: "",
    });
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    // Validation
    if (editData.password && editData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (editData.password !== editData.password_confirmation) {
      toast.error("Passwords do not match");
      return;
    }

    if (!editData.email) {
      toast.error("Email is required");
      return;
    }

    setIsUpdating(true);
    try {
      // Prepare update data - only include password if it's being changed
      const updateData: any = {
        email: editData.email,
      };

      if (editData.password) {
        updateData.password = editData.password;
        updateData.password_confirmation = editData.password_confirmation;
      }

      await apiService.admin.updateUser(selectedUser.user_id, updateData);
      toast.success("User updated successfully");
      handleCloseEditModal();
      fetchUsers(currentPage, searchTerm);
    } catch (error: any) {
      console.error("Error updating user:", error);
      if (error?.response?.status === 403) {
        toast.error("You don't have permission to update this user");
      } else if (error?.response?.status === 422) {
        const errors = error.response.data.errors;
        if (errors?.email) {
          toast.error(errors.email[0]);
        } else if (errors?.password) {
          toast.error(errors.password[0]);
        } else {
          toast.error("Validation error");
        }
      } else {
        toast.error("Failed to update user");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUsers(page, searchTerm);
  };

  const getUserRoleDisplay = (user: User) => {
    if (user.roles && user.roles.length > 0) {
      return user.roles[0].name;
    }
    return user.role || "User";
  };

  const getRoleBadgeColor = (role: string) => {
    let normalizedRole = role.toLowerCase();
    if (normalizedRole.includes("superadmin")) {
      normalizedRole = "superadmin";
    } else if (normalizedRole.includes("admin")) {
      normalizedRole = "admin";
    } else if (normalizedRole.includes("organizer")) {
      normalizedRole = "organizer"; 
    } else {
      normalizedRole = "donor";
    }

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
              View and manage all users ({totalUsers} total)
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
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleOpenEditModal(user)}
                              disabled={getUserRoleDisplay(user).toLowerCase().includes("superadmin")}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit

                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

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

        {/* Edit User Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update email or password for {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editData.email}
                  onChange={(e) =>
                    setEditData({ ...editData, email: e.target.value })
                  }
                  placeholder="user@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-password">New Password (optional)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={editData.password}
                  onChange={(e) =>
                    setEditData({ ...editData, password: e.target.value })
                  }
                  placeholder="Leave empty to keep current password"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-password-confirmation">
                  Confirm New Password
                </Label>
                <Input
                  id="edit-password-confirmation"
                  type="password"
                  value={editData.password_confirmation}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      password_confirmation: e.target.value,
                    })
                  }
                  placeholder="Confirm password"
                  disabled={!editData.password}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleCloseEditModal}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateUser} disabled={isUpdating}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isUpdating ? "Updating..." : "Update User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
