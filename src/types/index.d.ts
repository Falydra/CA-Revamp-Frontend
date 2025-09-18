export type User = {
  user_id: string;
  name: string;
  email: string;
  email_verified_at?: string | null;
  password?: string;
  remember_token?: string | null;
  created_at?: string;
  updated_at?: string;
  roles?: Role[];
  role?: string;
};

export type LoginResponse = {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
};

export type Book = {
  isbn: string;
  title: string;
  slug: string;
  synopsis?: string | null;
  author_1: string;
  author_2?: string | null;
  author_3?: string | null;
  published_year: string;
  cover_image_url?: string | null;
  price: number;
  created_at?: string;
  updated_at?: string;
};

export type BookWithAmount = {
  book: Book;
  amount: number;
};

export type Role = {
  role_id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
};

export type Organizer = {
  type: User;
  id: string;
  attributes: {
    name: string;
  };
};

export type OrganizerApplication = {
  application_id: string;
  user_id: string;
  full_name: string;
  phone_number: string;
  gender: string;
  date_of_birth: string;
  nik: string;
  id_card_image?: string | null;
  address_detail: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  city: string;
  province: string;
  postal_code: string;
  status: "pending" | "approved" | "rejected";
  reviewed_at?: string | null;
  created_at?: string;
  updated_at?: string;
  user?: User;
};

export type AdminStats = {
  total_users: number;
  total_campaigns: number;
  total_donations: number;
  pending_applications: number;
  pending_campaigns: number;
  total_funds_raised: number;
};

export type Campaign = {
  type: string;
  id: string;
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
  };
  links: string;
  
};

export type Fund = {
  fund_id: string;
  id: string;
  donor_id?: string | null;
  donor_name?: string | null;
  amount: number;
  status: string;
  verified_at?: string | null;
  created_at?: string;
  updated_at?: string;

  campaign?: Campaign;
  donor?: User;
};

export type DonatedBook = {
  donated_book_id: string;
  id: string;
  book_isbn: string;
  donor_id?: string | null;
  donor_name?: string | null;
  quantity: number;
  status: string;
  verified_at?: string | null;
  created_at?: string;
  updated_at?: string;

  campaign?: Campaign;
  book?: Book;
  donor?: User;
};

export type DonatedItem = {
  donated_item_id: string;
  id: string;
  requested_supply_id: string;
  donor_id?: string | null;
  donor_name?: string | null;
  quantity: number;
  status: string;
  verified_at?: string | null;
  created_at?: string;
  updated_at?: string;

  campaign?: Campaign;
  requested_supply?: RequestedSupply;
  donor?: User;
};

export type RequestedSupply = {
  requested_supply_id: string;
  id: string;
  name: string;
  description?: string | null;
  quantity_needed: number;
  quantity_received: number;
  unit: string;
  created_at?: string;
  updated_at?: string;

  campaign?: Campaign;
  donated_items?: DonatedItem[];
};

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
