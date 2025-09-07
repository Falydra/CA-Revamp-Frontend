export type User = {
  user_id: string; // Based on users table migration - string(14) primary key
  name: string; // Based on users table migration - string(25) unique
  email: string; // Based on users table migration - string(50) unique
  email_verified_at?: string | null; // timestamp nullable
  password?: string; // Only when creating/updating
  remember_token?: string | null;
  created_at?: string;
  updated_at?: string;
  roles?: Role[]; // From BelongsToManyRoles relationship
  role?: string; // Single role string - may be computed attribute
};

// Authentication API response types
export type LoginResponse = {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
};

// Fixed Book - Based on books table migration
export type Book = {
  isbn: string; // string(13) primary key
  title: string; // string(255) unique
  slug: string; // string(255)
  synopsis?: string | null; // text nullable
  author_1: string; // string(255)
  author_2?: string | null; // string(255) nullable
  author_3?: string | null; // string(255) nullable
  published_year: string; // string(4)
  cover_image_url?: string | null; // text nullable
  price: number; // decimal(10,2)
  created_at?: string;
  updated_at?: string;
};

export type BookWithAmount = {
  book: Book;
  amount: number;
};

// Role type based on roles table migration
export type Role = {
  role_id: string; // string(5) primary key
  name: string; // string
  created_at?: string;
  updated_at?: string;
};

export type Organizer = {
  type: User;
  id: string;
  attriutes: {
    name: string;
  }
}

export type Campaign = {
  type: string;
  campaign_id: string;
  attributes: {
    title: string;
    slug: string;
    description: string;
    header_image_url?: string | null;
    status: "pending" | "on_progress" | "finished" | "rejected";
    requested_fund_amount: number; 
    donated_fund_amount: number;   
    withdrawn_fund: number;
    requested_item_quantity: number;
    donated_item_quantity: number;
    created_at: string;
    reviewed_at: string;
  };
  relationships: {
    organizer: Organizer;
  }
  links: string;
};

// Fund type - for monetary donations to campaigns
export type Fund = {
  fund_id: string; // Primary key
  campaign_id: string; // Foreign key to campaigns
  donor_id?: string | null; // Foreign key to users (nullable for anonymous)
  donor_name?: string | null; // For anonymous donors
  amount: number; // decimal(15,2)
  status: string; // enum: pending, verified, rejected
  verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
  
  // Relationships
  campaign?: Campaign;
  donor?: User;
};

// DonatedBook type - for book donations to campaigns
export type DonatedBook = {
  donated_book_id: string; // Primary key
  campaign_id: string; // Foreign key to campaigns
  book_isbn: string; // Foreign key to books
  donor_id?: string | null; // Foreign key to users (nullable for anonymous)
  donor_name?: string | null; // For anonymous donors
  quantity: number;
  status: string; // enum: pending, verified, rejected
  verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
  
  // Relationships
  campaign?: Campaign;
  book?: Book;
  donor?: User;
};

// DonatedItem type - for supply/item donations to campaigns
export type DonatedItem = {
  donated_item_id: string; // Primary key
  campaign_id: string; // Foreign key to campaigns
  requested_supply_id: string; // Foreign key to requested_supplies
  donor_id?: string | null; // Foreign key to users (nullable for anonymous)
  donor_name?: string | null; // For anonymous donors
  quantity: number;
  status: string; // enum: pending, verified, rejected
  verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
  
  // Relationships
  campaign?: Campaign;
  requested_supply?: RequestedSupply;
  donor?: User;
};

// RequestedSupply type - supplies/items needed for campaigns
export type RequestedSupply = {
  requested_supply_id: string; // Primary key
  campaign_id: string; // Foreign key to campaigns
  name: string;
  description?: string | null;
  quantity_needed: number;
  quantity_received: number;
  unit: string;
  created_at?: string;
  updated_at?: string;
  
  // Relationships
  campaign?: Campaign;
  donated_items?: DonatedItem[];
};

// API Response types
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type PaginatedResponse<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  next_page_url?: string | null;
  prev_page_url?: string | null;
};

// Legacy types - keep for backward compatibility but mark for removal
export type Facility = {
  id: number | string;
  name: string;
  description: string;
  dimension: string;
  material: string;
  price: number | string;
  amount: number;
  status: boolean;
};

export type Product = {
  id: string;
  price: number;
  quantity: number;
  Product: string;
  name: string;
  description: string;
};

export type News = {
  id: number;
  title: string;
  description: string;
  image: string;
};

export type UserProfile = {
  full_name: string;
  phone_number: string | null;
  date_of_birth: string | null;
  gender: string | null;
  profile_picture: string | null;
} | null;

export type UserIdentity = {
  nik: string;
  full_name: string;
  id_card_image: string | null;
  verified_at: string | null;
  address: Address;
};

export type Address = {
  address_detail: string | null;
  rt: string | null;
  rw: string | null;
  kelurahan: string | null;
  kecamatan: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
} | null;

// Remove all Donation types as the donations table is unused
// Remove PageProps as it's from Inertia.js