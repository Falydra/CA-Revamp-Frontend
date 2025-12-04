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
import { Shield, Trash2, Plus, Loader2, Edit, Clock, Mail } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";

interface Admin {
  id?: string;
  user_id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export default function ManageAdmins() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  useEffect(() => {
    fetchAdmins();
  }, [currentPage]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await apiService.superAdmin.getAdmins(currentPage, 10);
      console.log("Admins API Response:", response);
      console.log("Admins data:", response?.data);
      console.log("Response structure:", {
        hasSuccess: 'success' in response,
        hasData: 'data' in response,
        dataType: typeof response?.data,
        dataIsArray: Array.isArray(response?.data),
        dataHasData: response?.data && 'data' in response.data,
      });
      
      if (response.success && response.data) {
        const adminsList = Array.isArray(response.data.data) ? response.data.data : [];
        console.log("Admins list:", adminsList);
        setAdmins(adminsList);
        setTotalPages(response.data.last_page || 1);
      } else {
        console.warn("Unexpected response format:", response);
        setAdmins([]);
      }
    } catch (error: any) {
      console.error("Error fetching admins:", error);
      console.error("Error response:", error?.response);
      toast.error("Failed to fetch admins: " + (error?.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.password_confirmation) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setCreating(true);
      const response = await apiService.superAdmin.createAdmin(formData);
      if (response.success) {
        toast.success("Admin created successfully");
        setShowCreateDialog(false);
        setFormData({
          name: "",
          email: "",
          password: "",
          password_confirmation: "",
        });
        fetchAdmins();
      }
    } catch (error: any) {
      console.error("Error creating admin:", error);
      const errorMessage = error?.response?.data?.message || "Failed to create admin";
      toast.error(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const handleEditAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;

    if (editFormData.password && editFormData.password !== editFormData.password_confirmation) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setUpdating(true);
      const updateData: any = {
        name: editFormData.name,
        email: editFormData.email,
      };
      if (editFormData.password) {
        updateData.password = editFormData.password;
        updateData.password_confirmation = editFormData.password_confirmation;
      }

      const response = await apiService.superAdmin.updateAdmin(selectedAdmin.user_id, updateData);
      if (response.success) {
        toast.success("Admin updated successfully");
        setShowEditDialog(false);
        setSelectedAdmin(null);
        setEditFormData({
          name: "",
          email: "",
          password: "",
          password_confirmation: "",
        });
        fetchAdmins();
      }
    } catch (error: any) {
      console.error("Error updating admin:", error);
      const errorMessage = error?.response?.data?.message || "Failed to update admin";
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;

    try {
      setDeleting(true);
      const response = await apiService.superAdmin.demoteAdmin(selectedAdmin.user_id);
      if (response.success) {
        toast.success("Admin demoted to donor successfully");
        setShowDeleteDialog(false);
        setSelectedAdmin(null);
        fetchAdmins();
      }
    } catch (error: any) {
      console.error("Error demoting admin:", error);
      const errorMessage = error?.response?.data?.message || "Failed to demote admin";
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return formatDate(dateString);
  };

  return (
    <Authenticated>
      <div className="space-y-6 p-4 w-full">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Manage Admins</h1>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Admin
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              List of Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : admins.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No admins found</p>
                
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </div>
                      </TableHead>
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
                    {admins.map((admin) => (
                      <TableRow key={admin.user_id}>
                        <TableCell className="font-medium">{admin.user_id}</TableCell>
                        <TableCell>
                          <span className="text-sm">{admin.email}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {getRelativeTime(admin.updated_at)}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(admin.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedAdmin(admin);
                                setEditFormData({
                                  name: admin.name,
                                  email: admin.email,
                                  password: "",
                                  password_confirmation: "",
                                });
                                setShowEditDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedAdmin(admin);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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

        {/* Create Admin Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Admin</DialogTitle>
              <DialogDescription>
                Add a new administrator to the platform
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAdmin}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password_confirmation">Confirm Password</Label>
                  <Input
                    id="password_confirmation"
                    type="password"
                    value={formData.password_confirmation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        password_confirmation: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Admin"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Admin Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Admin</DialogTitle>
              <DialogDescription>
                Update administrator information. Leave password fields empty to keep the current password.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditAdmin}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-password">New Password (optional)</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    value={editFormData.password}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, password: e.target.value })
                    }
                    placeholder="Leave empty to keep current password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-password_confirmation">Confirm New Password</Label>
                  <Input
                    id="edit-password_confirmation"
                    type="password"
                    value={editFormData.password_confirmation}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        password_confirmation: e.target.value,
                      })
                    }
                    placeholder="Leave empty to keep current password"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditDialog(false);
                    setSelectedAdmin(null);
                    setEditFormData({
                      name: "",
                      email: "",
                      password: "",
                      password_confirmation: "",
                    });
                  }}
                  disabled={updating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updating}>
                  {updating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Admin"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Demote Admin Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Demote Admin to Donor</DialogTitle>
              <DialogDescription>
                Are you sure you want to demote {selectedAdmin?.name} from admin to donor? 
                They will lose all admin privileges and become a regular donor user.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAdmin}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Demoting...
                  </>
                ) : (
                  "Demote to Donor"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Authenticated>
  );
}
