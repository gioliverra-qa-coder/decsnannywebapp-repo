export interface User {
  id: string;
  email: string;
  name: string;
  userType: 'parent' | 'nanny';
  profileComplete: boolean;
  parentProfile?: ParentProfile;
  nannyProfile?: NannyProfile;
}

export interface ParentProfile {
  children: Child[];
  address: string;
  phone: string;
  emergencyContact: string;
}

export interface Child {
  name: string;
  age: number;
  specialNeeds?: string;
}

export interface NannyProfile {
  experience: number;
  hourlyRate: number;
  availability: string[];
  bio: string;
  skills: string[];
  certifications: string[];
  location: string;
  rating: number;
  reviewCount: number;
  profileImage?: string;
}

export interface Booking {
  id: string;
  parentId: string;
  nannyId: string;
  nannyName: string;
  parentName: string;
  date: string;
  startTime: string;
  endTime: string;
  children: Child[];
  specialInstructions?: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'delivered';
  hourlyRate: number;
  totalAmount: number;
  createdAt: string;
}

export interface Nanny {
  id: string;
  name: string;
  experience: number;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  location: string;
  bio: string;
  skills: string[];
  availability: string[];
  profileImage: string;
}