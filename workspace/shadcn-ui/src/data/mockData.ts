import { Nanny } from '../types/user';

export const mockNannies: Nanny[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    experience: 5,
    hourlyRate: 25,
    rating: 4.8,
    reviewCount: 127,
    location: 'Downtown',
    bio: 'Experienced childcare provider with a passion for nurturing young minds. Certified in CPR and First Aid.',
    skills: ['CPR Certified', 'First Aid', 'Early Education', 'Cooking'],
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face'
  },
  {
    id: '2',
    name: 'Emily Chen',
    experience: 3,
    hourlyRate: 22,
    rating: 4.9,
    reviewCount: 89,
    location: 'Midtown',
    bio: 'Creative and energetic nanny who loves arts and crafts. Fluent in English and Mandarin.',
    skills: ['Arts & Crafts', 'Bilingual', 'Music', 'Homework Help'],
    availability: ['Monday', 'Wednesday', 'Friday', 'Saturday', 'Sunday'],
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'
  },
  {
    id: '3',
    name: 'Maria Rodriguez',
    experience: 8,
    hourlyRate: 30,
    rating: 4.7,
    reviewCount: 203,
    location: 'Westside',
    bio: 'Dedicated nanny with extensive experience in special needs care. Warm, patient, and reliable.',
    skills: ['Special Needs', 'CPR Certified', 'Cooking', 'Transportation'],
    availability: ['Tuesday', 'Thursday', 'Saturday', 'Sunday'],
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
  }
];

// Mock bookings data - this will be replaced by localStorage data
export const mockBookings = [
  {
    id: 'booking-1',
    nannyId: '1',
    parentId: 'parent-demo',
    nannyName: 'Sarah Johnson',
    parentName: 'John Smith',
    date: '2024-01-15',
    startTime: '09:00',
    endTime: '17:00',
    children: 2,
    specialRequests: 'Please help with homework after school',
    hourlyRate: 25,
    totalCost: 200,
    status: 'pending' as const,
    createdAt: new Date().toISOString()
  },
  {
    id: 'booking-2',
    nannyId: '2',
    parentId: 'parent-demo',
    nannyName: 'Emily Chen',
    parentName: 'John Smith',
    date: '2024-01-20',
    startTime: '10:00',
    endTime: '16:00',
    children: 1,
    specialRequests: 'Arts and crafts activities preferred',
    hourlyRate: 22,
    totalCost: 132,
    status: 'accepted' as const,
    createdAt: new Date().toISOString()
  }
];