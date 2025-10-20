export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  userType: 'parent' | 'nanny';
  profileImage?: string;
  createdAt: string;
}

export interface ParentProfile extends User {
  userType: 'parent';
  address: string;
  children: Child[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  preferences: {
    preferredAge: string;
    specialNeeds: string[];
    additionalNotes: string;
  };
}

export interface NannyProfile extends User {
  userType: 'nanny';
  bio: string;
  experience: number;
  skills: string[];
  hourlyRate: number;
  location: string;
  availability: string[];
  certifications: string[];
  languages: string[];
  ageGroups: string[];
  isVerified: boolean;
  rating: number;
  totalBookings: number;
}

export interface Child {
  id: string;
  name: string;
  age: number;
  specialNeeds?: string;
  allergies?: string[];
  notes?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}