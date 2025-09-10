import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/Layout/AuthenticatedLayout";
import { apiService } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { toast } from "sonner";
import type { User } from "@/types";

export default function AdminProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
          });
        }

        
    
          const response = await apiService.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
            setFormData({
              name: response.data.name || '',
              email: response.data.email || '',
            });
            
            localStorage.setItem("user", JSON.stringify(response.data));
          }
       
      } catch (error) {
        console.error("Error loading user data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      
      if (user) {
        const updatedUser = { ...user, ...formData };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setEditing(false);
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      toast.success("Logged out successfully!");
      navigate("/auth/login");
    } catch (error) {
      console.error("Error logging out:", error);
      
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      localStorage.removeItem("roles");
      navigate("/auth/login");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading profile...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <p className="text-lg text-muted-foreground mb-4">No user data found</p>
          <Button onClick={() => navigate("/auth/login")}>
            Go to Login
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
            <h1 className="text-2xl font-bold">Admin Profile</h1>
            <p className="text-muted-foreground">Update your account details below</p>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setEditing(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!editing}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!editing}
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user_id">User ID</Label>
                <Input
                  id="user_id"
                  value={user.user_id || 'N/A'}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value="Administrator"
                  disabled
                />
              </div>
            </div>

            {user.created_at && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Admin since: {new Date(user.created_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate("/dashboard/admin/manage-users")}
                className="w-full"
              >
                Manage Users
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/dashboard/admin/manage-donations")}
                className="w-full"
              >
                Manage Campaigns
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/dashboard/admin/manage-application")}
                className="w-full"
              >
                Review Applications
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/dashboard/admin")}
                className="w-full"
              >
                View Dashboard
              </Button>
            </div>
            
            <div className="pt-4 border-t">
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                className="w-full"
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}