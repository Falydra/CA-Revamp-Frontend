import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DoneeLayout from "@/Layout/AuthenticatedLayout";
import { apiService } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { toast } from "sonner";
import type { User } from "@/types";
import { Loader2 } from "lucide-react";

export default function DoneeProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Password change state
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        
        const storedUser = localStorage.getItem("user");
        let userData;
        if (storedUser) {
          userData = JSON.parse(storedUser);
          setUser(userData);
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
          });
        }

        
        try {
          const response = await apiService.getCurrentUser();
          if (response.success && response.data) {
            // Merge API response with existing userData to preserve all fields
            const mergedUser = {
              ...userData, // Keep existing data (user_id, phone, address, created_at, etc.)
              ...response.data, // Update with fresh data from API (name, email, roles)
            };
            
            setUser(mergedUser);
            setFormData({
              name: mergedUser.name || '',
              email: mergedUser.email || '',
              phone: mergedUser.phone || '',
            });
            
            // Save merged data back to localStorage
            localStorage.setItem("user", JSON.stringify(mergedUser));
          }
        } catch (apiError) {
          console.log("Could not fetch fresh user data, using stored data");
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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangePassword = async () => {
    if (passwordData.password !== passwordData.password_confirmation) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      setChangingPassword(true);
      const response = await apiService.updatePassword({
        current_password: passwordData.current_password,
        password: passwordData.password,
        password_confirmation: passwordData.password_confirmation,
      });

      if (response.success) {
        toast.success("Password changed successfully!");
        setPasswordData({
          current_password: '',
          password: '',
          password_confirmation: '',
        });
      }
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <DoneeLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        </div>
      </DoneeLayout>
    );
  }

  if (!user) {
    return (
      <DoneeLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <p className="text-lg text-muted-foreground mb-4">No user data found</p>
          <Button onClick={() => navigate("/auth/login")}>
            Go to Login
          </Button>
        </div>
      </DoneeLayout>
    );
  }

  return (
    <DoneeLayout>
      <div className="w-3/5  space-y-6 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Organizer Profile</h1>
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  Save Changes
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
                  value={user.identity?.full_name || formData.name}
                  disabled
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={user.identity?.phone_number || formData.phone}
                  disabled
                  placeholder="Enter phone number"
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
                <Label htmlFor="nik">NIK (ID Card Number)</Label>
                <Input
                  id="nik"
                  value={user.identity?.nik || 'Not provided'}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Input
                  id="gender"
                  value={user.identity?.gender ? user.identity.gender.charAt(0).toUpperCase() + user.identity.gender.slice(1) : 'Not provided'}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  value={user.identity?.date_of_birth || 'Not provided'}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="identity_id">Identity ID</Label>
                <Input
                  id="identity_id"
                  value={user.identity?.identity_id || 'N/A'}
                  disabled
                />
              </div>
            </div>

            {user.identity?.id_card_image_url && (
              <div className="pt-4 border-t">
                <Label>ID Card Image</Label>
                <div className="mt-2">
                  <img 
                    src={user.identity.id_card_image_url} 
                    alt="ID Card" 
                    className="max-w-md rounded-lg border"
                  />
                </div>
              </div>
            )}

            {user.created_at && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Member since: {new Date(user.created_at).toLocaleDateString('id-ID', {
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
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current_password">Current Password</Label>
              <Input
                id="current_password"
                name="current_password"
                type="password"
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={passwordData.password}
                onChange={handlePasswordChange}
                placeholder="Enter new password (min. 8 characters)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Confirm New Password</Label>
              <Input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                value={passwordData.password_confirmation}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
              />
            </div>

            <Button 
              onClick={handleChangePassword} 
              disabled={changingPassword || !passwordData.current_password || !passwordData.password || !passwordData.password_confirmation}
              className="w-full"
            >
              {changingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing Password...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate("/dashboard/organizer/donations")}
                className="flex-1"
              >
                View My Campaigns
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/dashboard/organizer/create")}
                className="flex-1"
              >
                Create Campaign
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
    </DoneeLayout>
  );
}