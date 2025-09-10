import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DonorLayout from "@/Layout/AuthenticatedLayout";
import { toast } from "sonner";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import axios from "axios";
import type { User } from "@/types";

export default function DoneeRegister() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone_number: "",
    gender: "",
    date_of_birth: "",
    nik: "",
    id_card_image: null as File | null,
    address_detail: "",
    rt: "",
    rw: "",
    kelurahan: "",
    kecamatan: "",
    city: "",
    province: "",
    postal_code: "",
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
          phone_number: userData.phone || "",
        }));
      } catch (error) {
        console.error("Error parsing user data:", error);
        navigate("/auth/login");
      }
    } else {
      toast.error("Please login to register as donee");
      navigate("/auth/login");
    }
  }, [navigate]);

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

    if (!form.id_card_image) {
      newErrors.id_card_image = "ID card image is required";
    }

    if (!form.address_detail.trim()) {
      newErrors.address_detail = "Address detail is required";
    }

    if (!form.rt.trim()) {
      newErrors.rt = "RT is required";
    }

    if (!form.rw.trim()) {
      newErrors.rw = "RW is required";
    }

    if (!form.kelurahan.trim()) {
      newErrors.kelurahan = "Kelurahan is required";
    }

    if (!form.kecamatan.trim()) {
      newErrors.kecamatan = "Kecamatan is required";
    }

    if (!form.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!form.province.trim()) {
      newErrors.province = "Province is required";
    }

    if (!form.postal_code.trim()) {
      newErrors.postal_code = "Postal code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

      const formData = new FormData();

      formData.append("user_id", user.user_id);

      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          if (key === "id_card_image" && value instanceof File) {
            formData.append(key, value);
          } else if (typeof value === "string") {
            formData.append(key, value);
          }
        }
      });

      console.log("Submitting donee registration...");

      const response = await axios.post(
        "http://localhost:8000/api/v1/donee-register",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success(
          "Registration successful! Please wait for admin verification."
        );

        setForm({
          full_name: "",
          phone_number: "",
          gender: "",
          date_of_birth: "",
          nik: "",
          id_card_image: null,
          address_detail: "",
          rt: "",
          rw: "",
          kelurahan: "",
          kecamatan: "",
          city: "",
          province: "",
          postal_code: "",
        });

        navigate("/dashboard/donor");
      }
    } catch (error: any) {
      console.error("Donee registration error:", error);

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error("Please check the form for errors");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <DonorLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading...</div>
        </div>
      </DonorLayout>
    );
  }

  return (
    <DonorLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Register as Initiator</h1>
          <p className="text-muted-foreground mt-2">
            Please fill in the information below correctly to register as a
            Initiator.
          </p>
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
                      className={`w-full p-2.5 border rounded-md ${
                        errors.gender ? "border-red-500" : "border-gray-300"
                      } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
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
                    <Label htmlFor="id_card_image">ID Card Image *</Label>
                    <Input
                      id="id_card_image"
                      name="id_card_image"
                      type="file"
                      accept="image/*"
                      onChange={handleChange}
                      className={errors.id_card_image ? "border-red-500" : ""}
                      required
                    />
                    {errors.id_card_image && (
                      <p className="text-red-500 text-sm">
                        {errors.id_card_image}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Address Information
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address_detail">Address Detail *</Label>
                    <Input
                      id="address_detail"
                      name="address_detail"
                      placeholder="Street name, building, house number"
                      value={form.address_detail}
                      onChange={handleChange}
                      className={errors.address_detail ? "border-red-500" : ""}
                      required
                    />
                    {errors.address_detail && (
                      <p className="text-red-500 text-sm">
                        {errors.address_detail}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rt">RT *</Label>
                      <Input
                        id="rt"
                        name="rt"
                        placeholder="RT"
                        value={form.rt}
                        onChange={handleChange}
                        className={errors.rt ? "border-red-500" : ""}
                        required
                      />
                      {errors.rt && (
                        <p className="text-red-500 text-sm">{errors.rt}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rw">RW *</Label>
                      <Input
                        id="rw"
                        name="rw"
                        placeholder="RW"
                        value={form.rw}
                        onChange={handleChange}
                        className={errors.rw ? "border-red-500" : ""}
                        required
                      />
                      {errors.rw && (
                        <p className="text-red-500 text-sm">{errors.rw}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="kelurahan">Kelurahan / Village *</Label>
                      <Input
                        id="kelurahan"
                        name="kelurahan"
                        placeholder="Enter Kelurahan / Village"
                        value={form.kelurahan}
                        onChange={handleChange}
                        className={errors.kelurahan ? "border-red-500" : ""}
                        required
                      />
                      {errors.kelurahan && (
                        <p className="text-red-500 text-sm">
                          {errors.kelurahan}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="kecamatan">Kecamatan / District *</Label>
                      <Input
                        id="kecamatan"
                        name="kecamatan"
                        placeholder="Enter Kecamatan / District"
                        value={form.kecamatan}
                        onChange={handleChange}
                        className={errors.kecamatan ? "border-red-500" : ""}
                        required
                      />
                      {errors.kecamatan && (
                        <p className="text-red-500 text-sm">
                          {errors.kecamatan}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City / Regency *</Label>
                      <Input
                        id="city"
                        name="city"
                        placeholder="Enter City / Regency"
                        value={form.city}
                        onChange={handleChange}
                        className={errors.city ? "border-red-500" : ""}
                        required
                      />
                      {errors.city && (
                        <p className="text-red-500 text-sm">{errors.city}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="province">Province *</Label>
                      <Input
                        id="province"
                        name="province"
                        placeholder="Enter Province"
                        value={form.province}
                        onChange={handleChange}
                        className={errors.province ? "border-red-500" : ""}
                        required
                      />
                      {errors.province && (
                        <p className="text-red-500 text-sm">
                          {errors.province}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Postal Code *</Label>
                    <Input
                      id="postal_code"
                      name="postal_code"
                      placeholder="Enter Postal Code"
                      value={form.postal_code}
                      onChange={handleChange}
                      className={errors.postal_code ? "border-red-500" : ""}
                      required
                    />
                    {errors.postal_code && (
                      <p className="text-red-500 text-sm">
                        {errors.postal_code}
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
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Registering..." : "Register as Donee"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DonorLayout>
  );
}
