import { Input } from "@/Components/ui/input";
import Authenticated from "@/Layout/AuthenticatedLayout";

import { Button } from "@/Components/ui/button";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";

export default function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [data, setData] = useState({
    name: "",
    email: "",
    role: "admin",
  });

  useEffect(() => {
    
    if (id) {
      console.log("Fetching user data for ID:", id);
      
      
      setData({
        name: "Example User",
        email: "user@example.com",
        role: "admin",
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    try {
      // TODO: Implement API call to update user
      console.log("Updating user:", { id, ...data });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("User updated successfully!");
      navigate("/super-admin/manage-users");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Authenticated>
      <div className="flex w-full justify-center items-center pt-8 bg-primary-bg text-white">
        <div className="flex flex-col w-1/2 items-start self-center gap-4 px-8 py-4">
          <div className="flex flex-col items-start w-full gap-1">
            <h1 className="text-2xl font-bold self-center">Edit User</h1>
            <p className="text-lg self-center">Update user information</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="w-full rounded-lg shadow-md flex flex-col gap-6 bg-primary-bg p-6 border border-white"
          >
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-white mb-1"
              >
                Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Enter name"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                className="text-primary-fg focus:text-primary-fg"
                required
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white mb-1"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                className="text-primary-fg focus:text-primary-fg"
                required
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-white mb-1"
              >
                Role
              </label>
              <select
                id="role"
                value={data.role}
                onChange={(e) => setData({ ...data, role: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md text-primary-fg focus:text-primary-fg"
                required
              >
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
                <option value="donor">Donor</option>
                <option value="donee">Donee</option>
              </select>
              {errors.role && (
                <p className="text-red-500 text-xs mt-1">{errors.role}</p>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={processing}
                className="flex-1 bg-primary-accent hover:bg-primary-accent/80"
              >
                {processing ? "Updating..." : "Update User"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/super-admin/manage-users")}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Authenticated>
  );
}
