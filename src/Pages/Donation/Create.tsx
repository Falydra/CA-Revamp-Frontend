import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import DonorLayout from "@/Layout/AuthenticatedLayout";
import type {  User } from "@/types";
import { apiService } from "@/services/api";
import AddTextDescriptionButton from "@/Pages/Donation/AddTextDescriptionButton";
import AddImageDescriptionButton from "@/Pages/Donation/AddImageDescriptionButton";
import DynamicTextDescription from "@/Pages/Donation/DynamicTextDescription";
import DynamicImageDescription from "@/Pages/Donation/DynamicImageDescription";
import { X, Plus, Book, Package, Loader2 } from "lucide-react";
import { Badge } from "@/Components/ui/badge";

interface TextDescription {
  id: string;
  content: string;
}

interface ImageDescription {
  id: string;
  file: File;
  url: string;
}

interface RequestedBook {
  book_id: string;
  title: string;
  author: string;
  requested_quantity: number;
}

interface RequestedSupply {
  id: string;
  name: string;
  description: string;
  price: number;
  requested_quantity: number;
}

interface BookOption {
  isbn: string;
  title: string;
  author: string;
  cover_image_url?: string;
}

export default function CreateCampaign() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    campaign_type: "fund",
    item_type: "book", 
    title: "",
    description: "",
    requested_fund_amount: "",
    requested_item_quantity: "",
    header_image: null as File | null,
    
    address_detail: "",
    village: "",
    sub_district: "",
    city: "",
    province: "",
    postal_code: "",
  });
  const [textDescriptions, setTextDescriptions] = useState<TextDescription[]>(
    []
  );
  const [imageDescriptions, setImageDescriptions] = useState<
    ImageDescription[]
  >([]);
  const [errors, setErrors] = useState<any>({});
  
  
  const [availableBooks, setAvailableBooks] = useState<BookOption[]>([]);
  const [requestedBooks, setRequestedBooks] = useState<RequestedBook[]>([]);
  const [requestedSupplies, setRequestedSupplies] = useState<RequestedSupply[]>([]);
  const [selectedBookId, setSelectedBookId] = useState("");
  const [bookQuantity, setBookQuantity] = useState("");
  const [bookDropdownOpen, setBookDropdownOpen] = useState(false);
  const [bookSearch, setBookSearch] = useState("");
  const [supplyForm, setSupplyForm] = useState({
    name: "",
    description: "",
    price: "",
    requested_quantity: "",
  });

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
    
    
    fetchAvailableBooks();
  }, [navigate]);
  
  const fetchAvailableBooks = async () => {
    try {
      const response = await apiService.getBooks();
      console.log("Books API response:", response);
      
      if (response.data && Array.isArray(response.data)) {
        
        const books = response.data.map((book: any) => {
          const attrs = book.attributes;
          
          
          let authorString = "Unknown Author";
          if (attrs.authors && typeof attrs.authors === 'object') {
            const authorParts = [
              attrs.authors.author_1,
              attrs.authors.author_2,
              attrs.authors.author_3
            ].filter(Boolean); 
            
            if (authorParts.length > 0) {
              authorString = authorParts.join(", ");
            }
          }
          
          return {
            isbn: attrs.isbn,
            title: attrs.title,
            author: authorString,
            cover_image_url: attrs.cover_image_url || null
          };
        });
        
        setAvailableBooks(books);
        console.log("Transformed books:", books);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
      toast.error("Failed to load books");
    }
  };
  
  const addRequestedBook = () => {
    if (!selectedBookId) {
      toast.error("Please select a book");
      return;
    }
    
    const quantity = parseInt(bookQuantity);
    if (!quantity || quantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }
    
    const book = availableBooks.find((b) => b.isbn === selectedBookId);
    if (!book) {
      toast.error("Book not found");
      return;
    }
    
    
    if (requestedBooks.some((rb) => rb.book_id === book.isbn)) {
      toast.error("This book is already added");
      return;
    }
    
    const newBook: RequestedBook = {
      book_id: book.isbn,
      title: book.title,
      author: book.author,
      requested_quantity: quantity,
    };
    
    setRequestedBooks((prev) => [...prev, newBook]);
    setSelectedBookId("");
    setBookQuantity("");
    toast.success("Book added to request list");
  };
  
  const removeRequestedBook = (bookId: string) => {
    setRequestedBooks((prev) => prev.filter((b) => b.book_id !== bookId));
    toast.success("Book removed from request list");
  };
  
  const addRequestedSupply = () => {
    if (!supplyForm.name.trim()) {
      toast.error("Please enter supply name");
      return;
    }
    
    const quantity = parseInt(supplyForm.requested_quantity);
    if (!quantity || quantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }
    
    const price = parseFloat(supplyForm.price);
    if (!price || price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    
    const newSupply: RequestedSupply = {
      id: Date.now().toString(),
      name: supplyForm.name,
      description: supplyForm.description,
      price: price,
      requested_quantity: quantity,
    };
    
    setRequestedSupplies((prev) => [...prev, newSupply]);
    setSupplyForm({
      name: "",
      description: "",
      price: "",
      requested_quantity: "",
    });
    toast.success("Supply added to request list");
  };
  
  const removeRequestedSupply = (supplyId: string) => {
    setRequestedSupplies((prev) => prev.filter((s) => s.id !== supplyId));
    toast.success("Supply removed from request list");
  };

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

    
    if (!form.address_detail.trim()) {
      newErrors.address_detail = "Address detail is required";
    }
    if (!form.village.trim()) {
      newErrors.village = "Village is required";
    }
    if (!form.sub_district.trim()) {
      newErrors.sub_district = "Sub-district is required";
    }
    if (!form.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!form.province.trim()) {
      newErrors.province = "Province is required";
    }
    if (!form.postal_code.trim()) {
      newErrors.postal_code = "Postal code is required";
    } else if (!/^\d{5}$/.test(form.postal_code)) {
      newErrors.postal_code = "Postal code must be exactly 5 digits";
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
        } else if (fundAmount < 50000) {
          newErrors.requested_fund_amount =
        "Minimum target amount is IDR 50,000";
        } else if (fundAmount > 999999999999) {
          newErrors.requested_fund_amount = "Target amount is too large";
        }
      }
    }

    if (form.campaign_type === "item") {
      
      if (form.item_type === "book") {
        if (requestedBooks.length === 0) {
          newErrors.requested_books = "Please add at least one book to the request list";
        }
      } else if (form.item_type === "supply") {
        if (requestedSupplies.length === 0) {
          newErrors.requested_supplies = "Please add at least one supply to the request list";
        }
      }
    }

    if (!form.header_image) {
      newErrors.header_image = "Header image is required";
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

      
      const type = form.campaign_type === "fund" ? "fundraiser" : "product_donation";
      formData.append("type", type);

      
      formData.append("attributes[title]", form.title);
      formData.append("attributes[description]", form.description);

      
      formData.append("address[address_detail]", form.address_detail);
      formData.append("address[village]", form.village);
      formData.append("address[sub_district]", form.sub_district);
      formData.append("address[city]", form.city);
      formData.append("address[province]", form.province);
      formData.append("address[postal_code]", form.postal_code);

      if (form.campaign_type === "fund" && form.requested_fund_amount) {
        formData.append(
          "attributes[requested_fund_amount]",
          form.requested_fund_amount
        );
      }

      if (form.campaign_type === "item") {
        
        formData.append("selection_mode", "manual");
        
        
        if (requestedBooks.length > 0) {
          requestedBooks.forEach((book, index) => {
            formData.append(`books[${index}][isbn]`, book.book_id);
            formData.append(`books[${index}][quantity]`, book.requested_quantity.toString());
          });
        }
        
        
        if (requestedSupplies.length > 0) {
          requestedSupplies.forEach((supply, index) => {
            formData.append(`supplies[${index}][name]`, supply.name);
            formData.append(`supplies[${index}][description]`, supply.description);
            formData.append(`supplies[${index}][quantity]`, supply.requested_quantity.toString());
          });
        }
        
        
        
      }

      if (form.header_image) {
        
        formData.append("attributes[header_image]", form.header_image);
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
        navigate("/dashboard/organizer");
      } else {
        throw new Error("Failed to create campaign");
      }
    } catch (error: any) {
      console.error("Campaign creation error:", error);
      console.error("Error response:", error.response);
      console.error("Error data:", error.response?.data);
      console.error("Error status:", error.response?.status);

      if (error.response?.data?.errors) {
        const serverErrors = error.response.data.errors;

        
        const mappedErrors: any = {};
        Object.entries(serverErrors).forEach(([field, messages]: any) => {
          let uiField = field;
          if (field.startsWith("attributes.")) {
            uiField = field.replace("attributes.", "");
          }
          
          if (uiField === 'requested_fund_amount') uiField = 'requested_fund_amount';
          if (uiField === 'requested_item_quantity') uiField = 'requested_item_quantity';
          if (uiField === 'header_image') uiField = 'header_image';

          mappedErrors[uiField] = messages;

          
          if (Array.isArray(messages) && messages.length > 0) {
            toast.error(`${uiField}: ${messages[0]}`);
          }
        });

        setErrors(mappedErrors);
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
          <div className="text-lg"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        </div>
      </DonorLayout>
    );
  }

  return (
    <DonorLayout>
      <div className="w-3/4 mx-auto space-y-6 p-4">
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
                  className="w-full h-9 px-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

              {/* Address Section */}
              <Card className="border-orange-200 bg-orange-50/50">
                <CardHeader>
                  <CardTitle className="text-lg">Campaign Address *</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    This address will be verified by admins to ensure your campaign is legitimate.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address_detail">Address Detail *</Label>
                    <Input
                      id="address_detail"
                      name="address_detail"
                      placeholder="Street address, building, house number"
                      value={form.address_detail}
                      onChange={handleInputChange}
                      className={errors.address_detail ? "border-red-500" : ""}
                      required
                    />
                    {errors.address_detail && (
                      <p className="text-red-500 text-sm">{errors.address_detail}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="village">Village/Kelurahan *</Label>
                      <Input
                        id="village"
                        name="village"
                        placeholder="Village name"
                        value={form.village}
                        onChange={handleInputChange}
                        className={errors.village ? "border-red-500" : ""}
                        required
                      />
                      {errors.village && (
                        <p className="text-red-500 text-sm">{errors.village}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sub_district">Sub-District/Kecamatan *</Label>
                      <Input
                        id="sub_district"
                        name="sub_district"
                        placeholder="Sub-district name"
                        value={form.sub_district}
                        onChange={handleInputChange}
                        className={errors.sub_district ? "border-red-500" : ""}
                        required
                      />
                      {errors.sub_district && (
                        <p className="text-red-500 text-sm">{errors.sub_district}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City/Kabupaten *</Label>
                      <Input
                        id="city"
                        name="city"
                        placeholder="City name"
                        value={form.city}
                        onChange={handleInputChange}
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
                        placeholder="Province name"
                        value={form.province}
                        onChange={handleInputChange}
                        className={errors.province ? "border-red-500" : ""}
                        required
                      />
                      {errors.province && (
                        <p className="text-red-500 text-sm">{errors.province}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postal_code">Postal Code *</Label>
                      <Input
                        id="postal_code"
                        name="postal_code"
                        placeholder="12345"
                        maxLength={5}
                        value={form.postal_code}
                        onChange={handleInputChange}
                        className={errors.postal_code ? "border-red-500" : ""}
                        required
                      />
                      {errors.postal_code && (
                        <p className="text-red-500 text-sm">{errors.postal_code}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                <>
                  {/* Item Type Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="item_type">Item Type *</Label>
                    <select
                      id="item_type"
                      name="item_type"
                      value={form.item_type}
                      onChange={handleInputChange}
                      className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="book">Books</option>
                    </select>
                  </div>

                  {/* Book Selection */}
                  {form.item_type === "book" && (
                    <Card className="border-blue-200 bg-blue-50/50">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Book className="h-5 w-5 text-blue-600" />
                          Requested Books
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Add Book Form */}
                        <div className="space-y-3 p-4 bg-white rounded-lg border">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="md:col-span-2">
                              <Label htmlFor="book_select">Select Book</Label>
                              <div className="relative">
                                {/* Custom dropdown to allow images and richer content */}
                                <div className="relative">
                                  <div
                                    tabIndex={0}
                                    role="button"
                                    onClick={() => setBookDropdownOpen(!bookDropdownOpen)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" || e.key === " ") setBookDropdownOpen(!bookDropdownOpen);
                                    }}
                                    className="w-full p-2.5 border border-gray-300 rounded-md flex items-center justify-between cursor-pointer"
                                  >
                                    <div className="truncate text-left">
                                      {selectedBookId ? (
                                        <>
                                          <div className="font-medium text-sm">
                                            {availableBooks.find((b) => b.isbn === selectedBookId)?.title}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            by {availableBooks.find((b) => b.isbn === selectedBookId)?.author}
                                          </div>
                                        </>
                                      ) : (
                                        <span className="text-gray-500">Choose a book...</span>
                                      )}
                                    </div>
                                    <svg className="ml-2 h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                                    </svg>
                                  </div>

                                  {bookDropdownOpen && (
                                    <div className="absolute z-20 left-0 right-0 mt-1 bg-white border rounded shadow max-h-60 overflow-auto">
                                      <div className="p-2">
                                        <input
                                          type="text"
                                          placeholder="Search books by title or author..."
                                          value={bookSearch}
                                          onChange={(e) => setBookSearch(e.target.value)}
                                          className="w-full p-2 border rounded"
                                        />
                                      </div>
                                      <div>
                                        {availableBooks.filter((b) => {
                                          const q = bookSearch.trim().toLowerCase();
                                          if (!q) return true;
                                          return (
                                            b.title.toLowerCase().includes(q) ||
                                            b.author.toLowerCase().includes(q) ||
                                            b.isbn.toLowerCase().includes(q)
                                          );
                                        }).map((book) => (
                                          <div
                                            key={book.isbn}
                                            onClick={() => {
                                              setSelectedBookId(book.isbn);
                                              setBookDropdownOpen(false);
                                              setBookSearch("");
                                            }}
                                            className="p-2 flex items-start gap-3 hover:bg-gray-50 cursor-pointer"
                                          >
                                            {book.cover_image_url ? (
                                              <img src={book.cover_image_url} alt={book.title} className="w-12 h-16 object-cover rounded border" />
                                            ) : (
                                              <div className="w-12 h-16 bg-gray-200 rounded border flex items-center justify-center">
                                                <Book className="h-5 w-5 text-gray-400" />
                                              </div>
                                            )}
                                            <div className="flex-1">
                                              <div className="font-medium text-sm">{book.title}</div>
                                              <div className="text-xs text-gray-500">by {book.author}</div>
                                              <div className="text-xs text-muted-foreground">ISBN: {book.isbn}</div>
                                            </div>
                                          </div>
                                        ))}
                                        {availableBooks.filter((b) => {
                                          const q = bookSearch.trim().toLowerCase();
                                          if (!q) return true;
                                          return (
                                            b.title.toLowerCase().includes(q) ||
                                            b.author.toLowerCase().includes(q) ||
                                            b.isbn.toLowerCase().includes(q)
                                          );
                                        }).length === 0 && (
                                          <div className="p-3 text-sm text-gray-500">No books found</div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Show selected book details */}
                                {selectedBookId && (() => {
                                  const selectedBook = availableBooks.find(b => b.isbn === selectedBookId);
                                  return selectedBook ? (
                                    <div className="mt-2 p-3 bg-gray-50 rounded-md flex gap-3 items-start">
                                      {selectedBook.cover_image_url ? (
                                        <img
                                          src={selectedBook.cover_image_url}
                                          alt={selectedBook.title}
                                          className="w-16 h-20 object-cover rounded border"
                                        />
                                      ) : (
                                        <div className="w-16 h-20 bg-gray-200 rounded border flex items-center justify-center">
                                          <Book className="h-8 w-8 text-gray-400" />
                                        </div>
                                      )}
                                      <div className="flex-1">
                                        <p className="font-medium text-sm">{selectedBook.title}</p>
                                        <p className="text-xs text-gray-600 mt-1">by {selectedBook.author}</p>
                                        <p className="text-xs text-gray-500 mt-1">ISBN: {selectedBook.isbn}</p>
                                      </div>
                                    </div>
                                  ) : null;
                                })()}
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="book_quantity">Quantity</Label>
                              <Input
                                id="book_quantity"
                                type="number"
                                min="1"
                                value={bookQuantity}
                                onChange={(e) => setBookQuantity(e.target.value)}
                                placeholder="Qty"
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            onClick={addRequestedBook}
                            className="w-full"
                            size="sm"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Book
                          </Button>
                        </div>

                        {/* Requested Books List */}
                        {requestedBooks.length > 0 ? (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">
                              Books to Request ({requestedBooks.length})
                            </p>
                            {requestedBooks.map((book) => (
                              <div
                                key={book.book_id}
                                className="flex items-center justify-between p-3 bg-white border rounded-lg"
                              >
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{book.title}</p>
                                  <p className="text-xs text-gray-500">by {book.author}</p>
                                  <Badge variant="secondary" className="mt-1">
                                    Qty: {book.requested_quantity}
                                  </Badge>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeRequestedBook(book.book_id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">
                            No books added yet. Select books from the list above.
                          </p>
                        )}
                        {errors.requested_books && (
                          <p className="text-red-500 text-sm">{errors.requested_books}</p>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Supply Selection */}
                  {form.item_type === "supply" && (
                    <Card className="border-green-200 bg-green-50/50">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Package className="h-5 w-5 text-green-600" />
                          Requested Supplies/Items
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Add Supply Form */}
                        <div className="space-y-3 p-4 bg-white rounded-lg border">
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="supply_name">Item Name</Label>
                              <Input
                                id="supply_name"
                                value={supplyForm.name}
                                onChange={(e) =>
                                  setSupplyForm({ ...supplyForm, name: e.target.value })
                                }
                                placeholder="e.g., School supplies, Medical equipment"
                              />
                            </div>
                            <div>
                              <Label htmlFor="supply_description">Description</Label>
                              <Textarea
                                id="supply_description"
                                value={supplyForm.description}
                                onChange={(e) =>
                                  setSupplyForm({ ...supplyForm, description: e.target.value })
                                }
                                placeholder="Describe the item"
                                rows={2}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label htmlFor="supply_price">Estimated Price (IDR)</Label>
                                <Input
                                  id="supply_price"
                                  type="number"
                                  min="0"
                                  value={supplyForm.price}
                                  onChange={(e) =>
                                    setSupplyForm({ ...supplyForm, price: e.target.value })
                                  }
                                  placeholder="Price per item"
                                />
                              </div>
                              <div>
                                <Label htmlFor="supply_quantity">Quantity Needed</Label>
                                <Input
                                  id="supply_quantity"
                                  type="number"
                                  min="1"
                                  value={supplyForm.requested_quantity}
                                  onChange={(e) =>
                                    setSupplyForm({
                                      ...supplyForm,
                                      requested_quantity: e.target.value,
                                    })
                                  }
                                  placeholder="Quantity"
                                />
                              </div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            onClick={addRequestedSupply}
                            className="w-full"
                            size="sm"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Supply Item
                          </Button>
                        </div>

                        {/* Requested Supplies List */}
                        {requestedSupplies.length > 0 ? (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">
                              Items to Request ({requestedSupplies.length})
                            </p>
                            {requestedSupplies.map((supply) => (
                              <div
                                key={supply.id}
                                className="flex items-center justify-between p-3 bg-white border rounded-lg"
                              >
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{supply.name}</p>
                                  {supply.description && (
                                    <p className="text-xs text-gray-500">{supply.description}</p>
                                  )}
                                  <div className="flex gap-2 mt-1">
                                    <Badge variant="secondary">Qty: {supply.requested_quantity}</Badge>
                                    <Badge variant="outline">
                                      {new Intl.NumberFormat("id-ID", {
                                        style: "currency",
                                        currency: "IDR",
                                      }).format(supply.price)}
                                    </Badge>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeRequestedSupply(supply.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">
                            No supplies added yet. Add items using the form above.
                          </p>
                        )}
                        {errors.requested_supplies && (
                          <p className="text-red-500 text-sm">{errors.requested_supplies}</p>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </>
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
