import { useEffect, useState } from "react";
import Authenticated from "@/Layout/AuthenticatedLayout";
import { apiService } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import { Users, Loader2, Clock, Mail, Shield, UserPlus, UserMinus, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";

interface User {
  user_id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  roles?: Array<{ name: string }>;
}

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [showDemoteDialog, setShowDemoteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [promoting, setPromoting] = useState(false);
  const [demoting, setDemoting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to page 1 when searching
      fetchUsers();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.superAdmin.getUsers(
        currentPage, 
        10,
        searchTerm.trim() !== '' ? searchTerm : undefined
      );
      console.log("Users API Response:", response);
      
      // The response structure is: { success: true, data: { data: [...], current_page, last_page, ... } }
      if (response.success && response.data) {
        const usersList = Array.isArray(response.data.data) ? response.data.data : [];
        console.log("Users list:", usersList);
        setUsers(usersList);
        setTotalPages(response.data.last_page || 1);
        setCurrentPage(response.data.current_page || 1);
      } else {
        console.warn("Unexpected response format:", response);
        setUsers([]);
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users: " + (error?.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToAdmin = async () => {
    if (!selectedUser) return;

    try {
      setPromoting(true);
      const response = await apiService.superAdmin.promoteToAdmin(selectedUser.user_id);
      if (response.success) {
        toast.success(`${selectedUser.name} has been promoted to Admin`);
        setShowPromoteDialog(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (error: any) {
      console.error("Error promoting user:", error);
      const errorMessage = error?.response?.data?.message || "Failed to promote user to admin";
      toast.error(errorMessage);
    } finally {
      setPromoting(false);
    }
  };

  const handleDemoteAdmin = async () => {
    if (!selectedUser) return;

    try {
      setDemoting(true);
      const response = await apiService.superAdmin.demoteAdmin(selectedUser.user_id);
      if (response.success) {
        toast.success(`${selectedUser.name} has been demoted from Admin`);
        setShowDemoteDialog(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (error: any) {
      console.error("Error demoting admin:", error);
      const errorMessage = error?.response?.data?.message || "Failed to demote admin";
      toast.error(errorMessage);
    } finally {
      setDemoting(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "N/A";
    }
  };

  const getRelativeTime = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return "Just now";
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
      return formatDate(dateString);
    } catch (error) {
      return "N/A";
    }
  };

  const getUserRole = (user: User): string => {
    if (!user.roles || user.roles.length === 0) return "User";
    const roleNames = user.roles.map(r => r.name);
    if (roleNames.includes("admin")) return "Admin";
    if (roleNames.includes("organizer")) return "Organizer";
    if (roleNames.includes("donor")) return "Donor";
    return "User";
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "Organizer":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "Donor":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const filteredUsers = users.filter(user => {
    const role = getUserRole(user);
    // Only show Donor, Organizer, and Admin users
    if (!["Donor", "Organizer", "Admin"].includes(role)) return false;
    
    // Apply search filter
    return user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_id.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <Authenticated>
      <div className="space-y-6 p-4 w-full">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Manage Users</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Manage Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            <div className="mb-4">
              <Input
                placeholder="Search by name, email, or user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "No users found matching your search" : "No users found"}
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </div>
                      </TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Last Update
                        </div>
                      </TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => {
                      const role = getUserRole(user);
                      const isAdmin = role === "Admin";
                      
                      return (
                        <TableRow key={user.user_id}>
                          <TableCell className="font-mono text-sm">{user.user_id || "N/A"}</TableCell>
                          <TableCell className="font-medium">{user.name || "N/A"}</TableCell>
                          <TableCell>
                            <span className="text-sm">{user.email || "N/A"}</span>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRoleBadgeColor(role)}>
                              {role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {getRelativeTime(user.updated_at)}
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(user.created_at)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {isAdmin ? (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setShowDemoteDialog(true);
                                    }}
                                    className="text-orange-600 focus:text-orange-600 cursor-pointer"
                                  >
                                    <UserMinus className="h-4 w-4 mr-2" />
                                    Demote from Admin
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setShowPromoteDialog(true);
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <Shield className="h-4 w-4 mr-2" />
                                    Promote to Admin
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Promote to Admin Dialog */}
        <Dialog open={showPromoteDialog} onOpenChange={setShowPromoteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Promote to Admin
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to promote <strong>{selectedUser?.name}</strong> to Administrator role?
                This will grant them administrative privileges on the platform.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <strong>User ID:</strong> 
                <span className="font-mono">{selectedUser?.user_id}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <strong>Email:</strong> 
                <span>{selectedUser?.email}</span>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowPromoteDialog(false);
                  setSelectedUser(null);
                }}
                disabled={promoting}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePromoteToAdmin}
                disabled={promoting}
                className="gap-2"
              >
                {promoting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Promoting...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    Promote to Admin
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Demote Admin Dialog */}
        <Dialog open={showDemoteDialog} onOpenChange={setShowDemoteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserMinus className="h-5 w-5 text-orange-600" />
                Demote from Admin
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to demote <strong>{selectedUser?.name}</strong> from Administrator role?
                They will lose all administrative privileges on the platform.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <strong>User ID:</strong> 
                <span className="font-mono">{selectedUser?.user_id}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <strong>Email:</strong> 
                <span>{selectedUser?.email}</span>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDemoteDialog(false);
                  setSelectedUser(null);
                }}
                disabled={demoting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDemoteAdmin}
                disabled={demoting}
                variant="destructive"
                className="gap-2"
              >
                {demoting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Demoting...
                  </>
                ) : (
                  <>
                    <UserMinus className="h-4 w-4" />
                    Demote from Admin
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Authenticated>
  );
}
