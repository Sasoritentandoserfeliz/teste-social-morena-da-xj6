export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  cpf?: string;
  cnpj?: string;
  type: 'donor' | 'institution' | 'admin';
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
}

export interface WorkingHours {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface Institution extends User {
  description: string;
  address: Address;
  workingHours: WorkingHours[];
  acceptedCategories: string[];
  rating: number;
  totalRatings: number;
  verified: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
}

export interface Donation {
  id: string;
  donorId: string;
  institutionId?: string;
  category: string;
  subcategory: string;
  description: string;
  quantity: number;
  condition: 'new' | 'used_good' | 'used_fair';
  images: string[];
  status: 'pending' | 'scheduled' | 'delivered' | 'cancelled';
  scheduledDate?: Date;
  deliveredDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Rating {
  id: string;
  donorId: string;
  institutionId: string;
  donationId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
}

export interface FilterOptions {
  category?: string;
  subcategory?: string;
  institutionType?: string;
  maxDistance?: number;
  minRating?: number;
  openNow?: boolean;
  searchQuery?: string;
}

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

export interface FormField {
  value: string;
  error: string;
  touched: boolean;
  isValid: boolean;
}