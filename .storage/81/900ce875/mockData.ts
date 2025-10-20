import { Nanny, Booking } from '../types';

export const mockNannies: Nanny[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
    bio: 'Experienced childcare provider with over 8 years of experience caring for children of all ages. I have a degree in Early Childhood Education and am certified in CPR and First Aid.',
    experience: 8,
    skills: ['CPR Certified', 'First Aid', 'Early Childhood Education', 'Meal Preparation', 'Homework Help'],
    hourlyRate: 25,
    rating: 4.9,
    location: 'Downtown',
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    reviews: [
      {
        id: '1',
        userName: 'Emily Chen',
        rating: 5,
        comment: 'Sarah is amazing with our 3-year-old. Very professional and caring.',
        date: '2024-01-15'
      }
    ]
  },
  {
    id: '2',
    name: 'Maria Rodriguez',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    bio: 'Bilingual nanny fluent in English and Spanish. I love engaging children in creative activities and educational games.',
    experience: 5,
    skills: ['Bilingual (English/Spanish)', 'Creative Activities', 'Educational Games', 'Swimming'],
    hourlyRate: 22,
    rating: 4.8,
    location: 'Westside',
    availability: ['Monday', 'Wednesday', 'Friday', 'Saturday', 'Sunday'],
    reviews: [
      {
        id: '2',
        userName: 'David Miller',
        rating: 5,
        comment: 'Maria is fantastic! Our kids love her and have learned so much Spanish.',
        date: '2024-01-10'
      }
    ]
  },
  {
    id: '3',
    name: 'Jennifer Lee',
    photo: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop&crop=face',
    bio: 'Former elementary school teacher turned nanny. I specialize in educational activities and homework assistance.',
    experience: 12,
    skills: ['Former Teacher', 'Homework Help', 'Educational Activities', 'Reading Support', 'Math Tutoring'],
    hourlyRate: 30,
    rating: 5.0,
    location: 'Northside',
    availability: ['Tuesday', 'Thursday', 'Saturday'],
    reviews: [
      {
        id: '3',
        userName: 'Lisa Wang',
        rating: 5,
        comment: 'Jennifer helped our daughter improve her reading skills tremendously.',
        date: '2024-01-08'
      }
    ]
  },
  {
    id: '4',
    name: 'Amanda Foster',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    bio: 'Energetic and fun-loving nanny who enjoys outdoor activities and sports with children.',
    experience: 4,
    skills: ['Outdoor Activities', 'Sports', 'Arts & Crafts', 'Music', 'Dance'],
    hourlyRate: 20,
    rating: 4.7,
    location: 'Eastside',
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    reviews: [
      {
        id: '4',
        userName: 'Michael Brown',
        rating: 5,
        comment: 'Amanda keeps our kids active and engaged. They always have fun!',
        date: '2024-01-12'
      }
    ]
  }
];

export const mockBookings: Booking[] = [
  {
    id: '1',
    nannyId: '1',
    nannyName: 'Sarah Johnson',
    date: '2024-01-25',
    time: '09:00',
    duration: 4,
    status: 'confirmed',
    userContact: {
      name: 'John Smith',
      email: 'john@example.com',
      phone: '555-0123'
    },
    specialRequirements: 'Please help with lunch preparation',
    totalCost: 100
  }
];