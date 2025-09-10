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

export default function DoneeProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
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
            phone: userData.phone || '',
            address: userData.address || '',
          });
        }

        
        try {
          const response = await apiService.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
            setFormData({
              name: response.data.name || '',
              email: response.data.email || '',
              phone: response.data.phone || '',
              address: response.data.address || '',
            });
            
            localStorage.setItem("user", JSON.stringify(response.data));
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

  if (loading) {
    return (
      <DoneeLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading profile...</div>
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
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Initiator Profile</h1>
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
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!editing}
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
                  value={formData.phone}
                  onChange={handleInputChange}
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

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!editing}
                  placeholder="Enter your address"
                />
              </div>
            </div>

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
            <CardTitle>Campaign Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-muted-foreground">Total Campaigns</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-muted-foreground">Active Campaigns</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">Rp 0</div>
                <div className="text-sm text-muted-foreground">Funds Raised</div>
              </div>
            </div>
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
                onClick={() => navigate("/dashboard/donee/donations")}
                className="flex-1"
              >
                View My Campaigns
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/dashboard/donee/donations/create")}
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