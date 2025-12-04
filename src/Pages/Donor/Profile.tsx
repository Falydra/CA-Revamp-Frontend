import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DonorLayout from "@/Layout/AuthenticatedLayout";
import { apiService } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { toast } from "sonner";
import type { User } from "@/types";
import { Loader2 } from "lucide-react";

export default function DonorProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [identityData, setIdentityData] = useState({
    full_name: '',
    phone_number: '',
    gender: '',
    date_of_birth: '',
    nik: '',
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [idCardImage, setIdCardImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [idCardImagePreview, setIdCardImagePreview] = useState<string | null>(null);
  
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
        
        // Load user data from localStorage first
        const storedUser = localStorage.getItem("user");
        let userData = null;
        
        if (storedUser) {
          userData = JSON.parse(storedUser);
          setUser(userData);
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
          });
          
          // Set identity data if exists
          if (userData.identity) {
            setIdentityData({
              full_name: userData.identity.full_name || '',
              phone_number: userData.identity.phone_number || '',
              gender: userData.identity.gender || '',
              date_of_birth: userData.identity.date_of_birth || '',
              nik: userData.identity.nik || '',
            });
            if (userData.identity.profile_image_url) {
              setProfileImagePreview(userData.identity.profile_image_url);
            }
            if (userData.identity.id_card_image_url) {
              setIdCardImagePreview(userData.identity.id_card_image_url);
            }
          }
        }

        // Fetch fresh data from API
        try {
          const response = await apiService.getCurrentUser();
          if (response.success && response.data) {
            const mergedUser = {
              ...userData,
              ...response.data,
            };
            
            setUser(mergedUser);
            
            // Update identity data if exists
            if (mergedUser.identity) {
              setIdentityData({
                full_name: mergedUser.identity.full_name || '',
                phone_number: mergedUser.identity.phone_number || '',
                gender: mergedUser.identity.gender || '',
                date_of_birth: mergedUser.identity.date_of_birth || '',
                nik: mergedUser.identity.nik || '',
              });
              if (mergedUser.identity.profile_image_url) {
                setProfileImagePreview(mergedUser.identity.profile_image_url);
              }
              if (mergedUser.identity.id_card_image_url) {
                setIdCardImagePreview(mergedUser.identity.id_card_image_url);
              }
            }
            
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

  const handleIdentityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setIdentityData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenderChange = (value: string) => {
    setIdentityData(prev => ({
      ...prev,
      gender: value
    }));
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdCardImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdCardImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdCardImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Prepare FormData for identity
      const formDataToSend = new FormData();
      formDataToSend.append('full_name', identityData.full_name);
      if (identityData.phone_number) formDataToSend.append('phone_number', identityData.phone_number);
      if (identityData.gender) formDataToSend.append('gender', identityData.gender);
      if (identityData.date_of_birth) formDataToSend.append('date_of_birth', identityData.date_of_birth);
      if (identityData.nik) formDataToSend.append('nik', identityData.nik);
      if (profileImage) formDataToSend.append('profile_image', profileImage);
      if (idCardImage) formDataToSend.append('id_card_image', idCardImage);

      // Create or update identity
      let response;
      if (user?.identity) {
        response = await apiService.updateIdentity(formDataToSend);
      } else {
        response = await apiService.createIdentity(formDataToSend);
      }

      if (response.success) {
        // Refresh user data
        const userResponse = await apiService.getCurrentUser();
        if (userResponse.success && userResponse.data) {
          const updatedUser = {
            ...user,
            ...userResponse.data,
          };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
          
          // Update identity data
          if (updatedUser.identity) {
            setIdentityData({
              full_name: updatedUser.identity.full_name || '',
              phone_number: updatedUser.identity.phone_number || '',
              gender: updatedUser.identity.gender || '',
              date_of_birth: updatedUser.identity.date_of_birth || '',
              nik: updatedUser.identity.nik || '',
            });
          }
        }
        
        setEditing(false);
        setProfileImage(null);
        setIdCardImage(null);
        toast.success("Identity information saved successfully!");
      }
    } catch (error: any) {
      console.error("Error saving identity:", error);
      toast.error(error.response?.data?.message || "Failed to save identity information");
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
      <DonorLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        </div>
      </DonorLayout>
    );
  }

  if (!user) {
    return (
      <DonorLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <p className="text-lg text-muted-foreground mb-4">No user data found</p>
          <Button onClick={() => navigate("/auth/login")}>
            Go to Login
          </Button>
        </div>
      </DonorLayout>
    );
  }

  return (
    <DonorLayout>
      <div className="max-w-2xl mx-auto space-y-6 w-full p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditing(true)}>
                Edit Identity
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
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={identityData.full_name}
                  onChange={handleIdentityChange}
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
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  value={identityData.phone_number}
                  onChange={handleIdentityChange}
                  disabled={!editing}
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
                  name="nik"
                  value={identityData.nik}
                  onChange={handleIdentityChange}
                  disabled={!editing}
                  placeholder="16-digit NIK"
                  maxLength={16}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={identityData.gender}
                  onValueChange={handleGenderChange}
                  disabled={!editing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  value={identityData.date_of_birth}
                  onChange={handleIdentityChange}
                  disabled={!editing}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="identity_id">Identity ID</Label>
                <Input
                  id="identity_id"
                  value={user.identity?.identity_id || 'Not yet created'}
                  disabled
                />
              </div>
            </div>

            {editing && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="profile_image">Profile Image</Label>
                  <Input
                    id="profile_image"
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    disabled={!editing}
                  />
                  {profileImagePreview && (
                    <div className="mt-2">
                      <img 
                        src={profileImagePreview} 
                        alt="Profile Preview" 
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="id_card_image">ID Card Image</Label>
                  <Input
                    id="id_card_image"
                    type="file"
                    accept="image/*"
                    onChange={handleIdCardImageChange}
                    disabled={!editing}
                  />
                  {idCardImagePreview && (
                    <div className="mt-2">
                      <img 
                        src={idCardImagePreview} 
                        alt="ID Card Preview" 
                        className="max-w-md rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {!editing && user.identity?.id_card_image_url && (
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
                onClick={() => navigate("/dashboard/donor/history")}
                className="flex-1"
              >
                View Donation History
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/campaigns")}
                className="flex-1"
              >
                Browse Campaigns
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
    </DonorLayout>
  );
}