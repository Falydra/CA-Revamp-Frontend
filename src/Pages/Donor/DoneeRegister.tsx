import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DonorLayout from "@/Layout/AuthenticatedLayout";
import { toast } from "sonner";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Loader2 } from "lucide-react";
import type { User,  OrganizerApplication } from "@/types";
import { apiService } from "@/services/api";

export default function DoneeRegister() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingIdentity, setCheckingIdentity] = useState(true);
  const [hasIdentity, setHasIdentity] = useState(false);
  const [existingApplication, setExistingApplication] =
    useState<OrganizerApplication | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    phone_number: "",
    gender: "",
    date_of_birth: "",
    nik: "",
    id_card_image: null as File | null,
  });
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setForm((prev) => ({
          ...prev,
          full_name: userData.name || "",
        }));
        checkUserIdentityAndApplication();
      } catch (error) {
        console.error("Error parsing user data:", error);
        navigate("/auth/login");
      }
    } else {
      toast.error("Please login to register as initiator");
      navigate("/auth/login");
    }
  }, [navigate]);

  const checkUserIdentityAndApplication = async () => {
    try {
      setCheckingIdentity(true);

      try {
        const identityResponse = await apiService.getIdentity();
        if (identityResponse.success && identityResponse.data) {
          setHasIdentity(true);

          const identity = identityResponse.data;
          setForm((prev) => ({
            ...prev,
            full_name: identity.full_name || prev.full_name,
            phone_number: identity.phone_number || "",
            gender: identity.gender || "",
            date_of_birth: identity.date_of_birth || "",
            nik: identity.nik || "",
          }));
        }
      } catch (identityError: any) {
        if (identityError.response?.status !== 404) {
          console.error("Error checking identity:", identityError);
        }
      }

      try {
        const applicationResponse = await apiService.getOrganizerApplication();
        if (applicationResponse.success && applicationResponse.data) {
          setExistingApplication(applicationResponse.data);
        }
      } catch (applicationError: any) {
        if (applicationError.response?.status !== 404) {
          console.error("Error checking application:", applicationError);
        }
      }
    } catch (error) {
      console.error("Error in checkUserIdentityAndApplication:", error);
    } finally {
      setCheckingIdentity(false);
    }
  };

  const handleReapply = async () => {
      try {
        setLoading(true);
        const resp = await apiService.reapplyOrganizerApplication();
        if (resp && resp.success) {
          toast.success("Application re-submitted. Please wait for admin review.");
          if (resp.data) setExistingApplication(resp.data);
          else navigate("/dashboard/donor");
        } else {
          toast.error("Failed to reapply. Please try again.");
        }
      } catch (err: any) {
        console.error("Reapply error:", err);
        if (err.response?.data?.message) {
          toast.error(err.response.data.message);
        } else {
          toast.error("Failed to reapply. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, files } = target;

    setForm((f) => ({
      ...f,
      [name]: files ? files[0] : value,
    }));
    if (errors[name]) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!form.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    }

    if (!form.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    }

    if (!form.gender) {
      newErrors.gender = "Gender is required";
    }

    if (!form.date_of_birth) {
      newErrors.date_of_birth = "Date of birth is required";
    }

    if (!form.nik.trim()) {
      newErrors.nik = "NIK is required";
    } else if (form.nik.length !== 16) {
      newErrors.nik = "NIK must be exactly 16 digits";
    }

    if (!hasIdentity && !form.id_card_image) {
      newErrors.id_card_image = "ID card image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleQuickApply = async () => {
    if (!user) {
      toast.error("User not found. Please login again.");
      navigate("/auth/login");
      return;
    }

    try {
      setLoading(true);
      
      console.log("Submitting organizer application with existing identity...");
      const applicationResponse = await apiService.createOrganizerApplication();

      if (applicationResponse.success) {
        toast.success(
          "Initiator application submitted successfully! Please wait for admin review."
        );
        navigate("/dashboard/donor");
      } else {
        throw new Error("Failed to submit organizer application");
      }
    } catch (error: any) {
      console.error("Quick apply error:", error);

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.error === "identities") {
        toast.error("Please complete your identity information first");
      } else if (error.response?.data?.error === "organizer_applications") {
        toast.error("You already have an active application");
      } else {
        toast.error("Application failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    if (!user) {
      toast.error("User not found. Please login again.");
      navigate("/auth/login");
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      if (!hasIdentity) {
        const formData = new FormData();
        formData.append("full_name", form.full_name);
        formData.append("phone_number", form.phone_number);
        formData.append("gender", form.gender);
        formData.append("date_of_birth", form.date_of_birth);
        formData.append("nik", form.nik);

        if (form.id_card_image) {
          formData.append("id_card_image", form.id_card_image);
        }

        console.log("Creating identity...");
        const identityResponse = await apiService.createIdentity(formData);

        if (!identityResponse.success) {
          throw new Error("Failed to create identity");
        }

        setHasIdentity(true);
        toast.success("Identity information saved successfully");
      } else {
        // Only update identity if user made changes
        const formData = new FormData();
        formData.append("full_name", form.full_name);
        formData.append("phone_number", form.phone_number);
        formData.append("gender", form.gender);
        formData.append("date_of_birth", form.date_of_birth);
        formData.append("nik", form.nik);

        if (form.id_card_image) {
          formData.append("id_card_image", form.id_card_image);
        }

        console.log("Updating identity...");
        await apiService.updateIdentity(formData);
        toast.success("Identity information updated successfully");
      }

      console.log("Submitting organizer application...");
      const applicationResponse = await apiService.createOrganizerApplication();

      if (applicationResponse.success) {
        toast.success(
          "Initiator application submitted successfully! Please wait for admin review."
        );

        navigate("/dashboard/donor");
      } else {
        throw new Error("Failed to submit organizer application");
      }
    } catch (error: any) {
      console.error("Initiator registration error:", error);

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error("Please check the form for errors");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.error === "identities") {
        toast.error("Please complete your identity information first");
      } else if (error.response?.data?.error === "organizer_applications") {
        toast.error("You already have an active application");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  console.log("Status", existingApplication);

  if (checkingIdentity) {
    return (
      <DonorLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading...</div>
        </div>
      </DonorLayout>
    );
  }

  if (existingApplication) {
    return (
      <DonorLayout>
        <div className="w-3/6 h-full flex items-center justify-center">
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>You already have an organizer application.</p>
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Status:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        existingApplication.attributes.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : existingApplication.attributes.status === "accepted"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {existingApplication.attributes.status
                        ? existingApplication.attributes.status.charAt(0).toUpperCase() +
                          existingApplication.attributes.status.slice(1)
                        : "N/A"}
                    </span>
                  </div>
                  {existingApplication.attributes.status === "pending" && (
                    <p className="text-sm text-gray-600 mt-2">
                      Your application is being reviewed by our admin team.
                    </p>
                  )}
                  {existingApplication.attributes.status === "accepted" && (
                    <p className="text-sm text-primary-bg mt-2">
                      Congratulations! Your application has been approved.
                    </p>
                  )}
                  {existingApplication.attributes.status === "rejected" && (
                    <p className="text-sm text-red-600 mt-2">
                      Your application was rejected. Please contact support for
                      more information.
                    </p>
                  )}
                </div>
                <div className="flex-row flex md:grid-cols-2 gap-4 items-center">
                  <Button
                    onClick={() => navigate("/dashboard/donor")}
                    className="w-full"
                  > 
                    Back to Dashboard
                  </Button>

                  {existingApplication.attributes.status === "rejected" && (
                    <Button onClick={handleReapply} className="w-full">
                      Re-Apply
                    </Button>
                  )}
                  {existingApplication.attributes.status === "accepted" && (
                    <Button onClick={() => navigate("/dashboard/organizer")} className="w-full">
                      Go to Dashboard
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DonorLayout>
    );
  }

  if (!user) {
    return (
      <DonorLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        </div>
      </DonorLayout>
    );
  }

  return (
    <DonorLayout>
      <div className="max-w-4xl mx-auto space-y-6 p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Register as Initiator</h1>
          <p className="text-muted-foreground mt-2">
            Please fill in the information below correctly to register as an
            Initiator.
          </p>
          {hasIdentity && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm font-medium">
                ✓ Identity information found. You can review and update the
                details below, or apply directly with your existing information.
              </p>
              <Button 
                onClick={handleQuickApply} 
                disabled={loading}
                className="mt-3"
                size="sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Quick Apply Now'
                )}
              </Button>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Initiator Registration Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      placeholder="Enter your full name"
                      value={form.full_name}
                      onChange={handleChange}
                      className={errors.full_name ? "border-red-500" : ""}
                      required
                    />
                    {errors.full_name && (
                      <p className="text-red-500 text-sm">{errors.full_name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number *</Label>
                    <Input
                      id="phone_number"
                      name="phone_number"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={form.phone_number}
                      onChange={handleChange}
                      className={errors.phone_number ? "border-red-500" : ""}
                      required
                    />
                    {errors.phone_number && (
                      <p className="text-red-500 text-sm">
                        {errors.phone_number}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <select
                      id="gender"
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className={`w-full h-9 px-2 text-sm border rounded-md ${
                        errors.gender ? "border-red-500" : "border-gray-300"
                      } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    {errors.gender && (
                      <p className="text-red-500 text-sm">{errors.gender}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth *</Label>
                    <Input
                      id="date_of_birth"
                      name="date_of_birth"
                      type="date"
                      value={form.date_of_birth}
                      onChange={handleChange}
                      className={errors.date_of_birth ? "border-red-500" : ""}
                      required
                    />
                    {errors.date_of_birth && (
                      <p className="text-red-500 text-sm">
                        {errors.date_of_birth}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Identity Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nik">
                      NIK (National Identity Number) *
                    </Label>
                    <Input
                      id="nik"
                      name="nik"
                      placeholder="Enter your 16-digit NIK"
                      value={form.nik}
                      onChange={handleChange}
                      className={errors.nik ? "border-red-500" : ""}
                      maxLength={16}
                      required
                    />
                    {errors.nik && (
                      <p className="text-red-500 text-sm">{errors.nik}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="id_card_image">
                      ID Card Image {!hasIdentity && "*"}
                    </Label>
                    <Input
                      id="id_card_image"
                      name="id_card_image"
                      type="file"
                      accept="image/*"
                      onChange={handleChange}
                      className={errors.id_card_image ? "border-red-500" : ""}
                      required={!hasIdentity}
                    />
                    {hasIdentity && (
                      <p className="text-sm text-gray-600">
                        Upload a new image to update your existing ID card image
                      </p>
                    )}
                    {errors.id_card_image && (
                      <p className="text-red-500 text-sm">
                        {errors.id_card_image}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard/donor")}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : hasIdentity ? (
                    "Update & Apply as Initiator"
                  ) : (
                    "Apply as Initiator"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DonorLayout>
  );
}
