export interface Nanny {
  id: string;
  name: string;
  photo: string;
  bio: string;
  experience: number;
  skills: string[];
  hourlyRate: number;
  rating: number;
  location: string;
  availability: string[];
  reviews: Review[];
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Booking {
  id: string;
  nannyId: string;
  nannyName: string;
  date: string;
  time: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  userContact: {
    name: string;
    email: string;
    phone: string;
  };
  specialRequirements?: string;
  totalCost: number;
}