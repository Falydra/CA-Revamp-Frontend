import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/Layout/AuthenticatedLayout";
import { apiService } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Badge } from "@/Components/ui/badge";
import { toast } from "sonner";
import type { User } from "@/types";

export default function EditUser() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    const loadUser = async () => {
      if (!userId) {
        toast.error("User ID not provided");
        navigate("/dashboard/admin/manage-users");
        return;
      }

      try {
        setLoading(true);

        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          if (userData.user_id === userId) {
            setUser(userData);
            setFormData({
              name: userData.name || "",
              email: userData.email || "",
              password: "",
            });
          }
        }

        try {
          const response = await apiService.admin.getUsers(1, 100);
          if (response.data) {
            const users = Array.isArray(response.data.data)
              ? response.data.data
              : Array.isArray(response.data)
              ? response.data
              : [];

            const targetUser = users.find((u: User) => u.user_id === userId);
            if (targetUser) {
              setUser(targetUser);
              setFormData({
                name: targetUser.name || "",
                email: targetUser.email || "",
                password: "",
              });
            }
          }
        } catch (error) {
          console.log("Could not fetch user from API");
        }
      } catch (error) {
        console.error("Error loading user:", error);
        toast.error("Failed to load user data");
        navigate("/dashboard/admin/manage-users");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !userId) {
      toast.error("User data not available");
      return;
    }

    try {
      setSaving(true);
      setErrors({});

      const updateData: any = {
        name: formData.name,
        email: formData.email,
      };

      if (formData.password.trim()) {
        updateData.password = formData.password;
      }

      const response = await apiService.admin.updateUser(userId, updateData);

      if (response.success) {
        toast.success("User updated successfully!");
        navigate("/dashboard/admin/manage-users");
      } else {
        toast.error("Failed to update user");
      }
    } catch (error: any) {
      console.error("Error updating user:", error);

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error("Please check the form for errors");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update user");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading user data...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <p className="text-lg text-muted-foreground mb-4">User not found</p>
          <Button onClick={() => navigate("/dashboard/admin/manage-users")}>
            Back to Users
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Edit User</h1>
            <p className="text-muted-foreground">Modify user details below</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/admin/manage-users")}
          >
            Back to Users
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={errors.name ? "border-red-500" : ""}
                    placeholder="Enter full name"
                    required
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? "border-red-500" : ""}
                    placeholder="Enter email address"
                    required
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user_id">User ID</Label>
                  <Input id="user_id" value={user.user_id} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Current Role</Label>
                  <div className="flex items-center h-10">
                    <Badge variant="secondary">
                      {user.role || user.roles?.[0]?.name || "User"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? "border-red-500" : ""}
                  placeholder="Leave blank to keep current password"
                />
                <p className="text-xs text-muted-foreground">
                  Enter a new password only if you want to change it
                </p>
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>

              {user.created_at && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    User created:{" "}
                    {new Date(user.created_at).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard/admin/manage-users")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? "Updating..." : "Update User"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
