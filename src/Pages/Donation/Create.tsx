import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import DonorLayout from "@/Layout/AuthenticatedLayout";
import type { Role, User } from "@/types";
import { apiService } from "@/services/api";
import AddTextDescriptionButton from "@/Pages/Donation/AddTextDescriptionButton";
import AddImageDescriptionButton from "@/Pages/Donation/AddImageDescriptionButton";
import DynamicTextDescription from "@/Pages/Donation/DynamicTextDescription";
import DynamicImageDescription from "@/Pages/Donation/DynamicImageDescription";

interface TextDescription {
  id: string;
  content: string;
}

interface ImageDescription {
  id: string;
  file: File;
  url: string;
}

export default function CreateCampaign() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    campaign_type: "fund",
    title: "",
    description: "",
    requested_fund_amount: "",
    requested_item_quantity: "",
    header_image: null as File | null,
  });
  const [textDescriptions, setTextDescriptions] = useState<TextDescription[]>(
    []
  );
  const [imageDescriptions, setImageDescriptions] = useState<
    ImageDescription[]
  >([]);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error("Error parsing user data:", error);
        navigate("/auth/login");
      }
    } else {
      toast.error("Please login to create a campaign");
      navigate("/auth/login");
    }
  }, [navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, files } = target;

    if (files) {
      setForm((prev) => ({
        ...prev,
        [name]: files[0],
      }));
      return;
    }

    if (
      name === "requested_fund_amount" ||
      name === "requested_item_quantity"
    ) {
      const numericValue = value.replace(/[^0-9.]/g, "");

      const parts = numericValue.split(".");
      const validValue =
        parts.length > 2
          ? parts[0] + "." + parts.slice(1).join("")
          : numericValue;

      if (name === "requested_fund_amount") {
        const numValue = parseFloat(validValue);
        if (validValue !== "" && (numValue <= 0 || numValue > 999999999999)) {
          return;
        }
      }

      if (name === "requested_item_quantity") {
        const intValue = parseInt(validValue);
        if (validValue !== "" && (intValue <= 0 || intValue > 999999)) {
          return;
        }

        setForm((prev) => ({
          ...prev,
          [name]: validValue.split(".")[0],
        }));
        return;
      }

      setForm((prev) => ({
        ...prev,
        [name]: validValue,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    if (errors[name]) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!form.title.trim()) {
      newErrors.title = "Campaign title is required";
    }

    if (!form.description.trim()) {
      newErrors.description = "Campaign description is required";
    }

    if (form.campaign_type === "fund") {
      if (
        !form.requested_fund_amount ||
        form.requested_fund_amount.trim() === ""
      ) {
        newErrors.requested_fund_amount = "Target fund amount is required";
      } else {
        const fundAmount = parseFloat(form.requested_fund_amount);
        if (isNaN(fundAmount) || fundAmount <= 0) {
          newErrors.requested_fund_amount =
            "Target fund amount must be greater than 0";
        } else if (fundAmount < 10000) {
          newErrors.requested_fund_amount =
            "Minimum target amount is IDR 10,000";
        } else if (fundAmount > 999999999999) {
          newErrors.requested_fund_amount = "Target amount is too large";
        }
      }
    }

    if (form.campaign_type === "item") {
      if (
        !form.requested_item_quantity ||
        form.requested_item_quantity.trim() === ""
      ) {
        newErrors.requested_item_quantity = "Target item quantity is required";
      } else {
        const itemQuantity = parseInt(form.requested_item_quantity);
        if (isNaN(itemQuantity) || itemQuantity <= 0) {
          newErrors.requested_item_quantity =
            "Target item quantity must be greater than 0";
        } else if (itemQuantity > 999999) {
          newErrors.requested_item_quantity = "Target quantity is too large";
        }
      }
    }

    if (!form.header_image) {
      newErrors.header_image = "Header image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addTextDescription = () => {
    const newDescription: TextDescription = {
      id: Date.now().toString(),
      content: "",
    };
    setTextDescriptions((prev) => [...prev, newDescription]);
  };

  const updateTextDescription = (
    index: number,
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { value } = e.target;
    setTextDescriptions((prev) =>
      prev.map((desc, i) => (i === index ? { ...desc, content: value } : desc))
    );
  };

  const removeTextDescription = (index: number) => {
    setTextDescriptions((prev) => prev.filter((_, i) => i !== index));
  };

  const addImageDescription = (file: File) => {
    const newImage: ImageDescription = {
      id: Date.now().toString(),
      file,
      url: URL.createObjectURL(file),
    };
    setImageDescriptions((prev) => [...prev, newImage]);
  };

  const removeImageDescription = (index: number) => {
    setImageDescriptions((prev) => {
      const removed = prev[index];
      if (removed?.url) {
        URL.revokeObjectURL(removed.url);
      }
      return prev.filter((_, i) => i !== index);
    });
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
      formData.append("campaign_type", form.campaign_type);
      formData.append("title", form.title);
      formData.append("description", form.description);

      if (form.campaign_type === "fund" && form.requested_fund_amount) {
        formData.append("requested_fund_amount", form.requested_fund_amount);
      }

      if (form.campaign_type === "item" && form.requested_item_quantity) {
        formData.append(
          "requested_item_quantity",
          form.requested_item_quantity
        );
      }

      if (form.header_image) {
        formData.append("header_image", form.header_image);
      }

      textDescriptions.forEach((desc, index) => {
        if (desc.content.trim()) {
          formData.append(`text_descriptions[${index}]`, desc.content);
        }
      });

      imageDescriptions.forEach((img, index) => {
        formData.append(`image_descriptions[${index}]`, img.file);
      });

      console.log("Creating campaign...");
      const response = await apiService.createCampaign(formData);

      if (response.success) {
        toast.success(
          "Campaign created successfully! Please wait for admin approval."
        );
        navigate("/dashboard/donor");
      } else {
        throw new Error("Failed to create campaign");
      }
    } catch (error: any) {
      console.error("Campaign creation error:", error);

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error("Please check the form for errors");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to create campaign. Please try again.");
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
          <h1 className="text-3xl font-bold">Create New Campaign</h1>
          <p className="text-muted-foreground mt-2">
            Create a new fundraising or donation campaign
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="campaign_type">Campaign Type *</Label>
                <select
                  id="campaign_type"
                  name="campaign_type"
                  value={form.campaign_type}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="fund">Fundraising Campaign</option>
                  <option value="item">Item Donation Campaign</option>
                </select>
                {errors.campaign_type && (
                  <p className="text-red-500 text-sm">{errors.campaign_type}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Campaign Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter campaign title"
                  value={form.title}
                  onChange={handleInputChange}
                  className={errors.title ? "border-red-500" : ""}
                  required
                />
                {errors.title && (
                  <p className="text-red-500 text-sm">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Campaign Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your campaign"
                  value={form.description}
                  onChange={handleInputChange}
                  className={errors.description ? "border-red-500" : ""}
                  rows={4}
                  required
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description}</p>
                )}
              </div>

              {form.campaign_type === "fund" && (
                <div className="space-y-2">
                  <Label htmlFor="requested_fund_amount">
                    Target Amount (IDR) *
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      IDR
                    </span>
                    <Input
                      id="requested_fund_amount"
                      name="requested_fund_amount"
                      type="text"
                      placeholder="Enter target amount (min. 10,000)"
                      value={form.requested_fund_amount}
                      onChange={handleInputChange}
                      className={`pl-12 ${
                        errors.requested_fund_amount ? "border-red-500" : ""
                      }`}
                      required
                    />
                  </div>
                  {form.requested_fund_amount && (
                    <p className="text-sm text-gray-600">
                      Target:{" "}
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      }).format(parseFloat(form.requested_fund_amount) || 0)}
                    </p>
                  )}
                  {errors.requested_fund_amount && (
                    <p className="text-red-500 text-sm">
                      {errors.requested_fund_amount}
                    </p>
                  )}
                </div>
              )}

              {form.campaign_type === "item" && (
                <div className="space-y-2">
                  <Label htmlFor="requested_item_quantity">
                    Target Item Quantity *
                  </Label>
                  <Input
                    id="requested_item_quantity"
                    name="requested_item_quantity"
                    type="text"
                    placeholder="Enter target quantity (e.g., 100)"
                    value={form.requested_item_quantity}
                    onChange={handleInputChange}
                    className={
                      errors.requested_item_quantity ? "border-red-500" : ""
                    }
                    required
                  />
                  {form.requested_item_quantity && (
                    <p className="text-sm text-gray-600">
                      Target: {parseInt(form.requested_item_quantity) || 0}{" "}
                      items
                    </p>
                  )}
                  {errors.requested_item_quantity && (
                    <p className="text-red-500 text-sm">
                      {errors.requested_item_quantity}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="header_image">Header Image *</Label>
                <Input
                  id="header_image"
                  name="header_image"
                  type="file"
                  accept="image/*"
                  onChange={handleInputChange}
                  className={errors.header_image ? "border-red-500" : ""}
                  required
                />
                {errors.header_image && (
                  <p className="text-red-500 text-sm">{errors.header_image}</p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold">Additional Content</h3>
                  <div className="flex gap-2">
                    <AddTextDescriptionButton onClick={addTextDescription} />
                    <AddImageDescriptionButton
                      onFileSelected={addImageDescription}
                    />
                  </div>
                </div>

                {textDescriptions.map((desc, index) => (
                  <DynamicTextDescription
                    key={desc.id}
                    index={index}
                    value={desc.content}
                    onChange={updateTextDescription}
                    onRemove={removeTextDescription}
                  />
                ))}

                {imageDescriptions.map((img, index) => (
                  <DynamicImageDescription
                    key={img.id}
                    index={index}
                    url={img.url}
                    onChange={() => {}}
                    onRemove={removeImageDescription}
                  />
                ))}
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard/organizer")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Creating..." : "Create Campaign"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DonorLayout>
  );
}
