import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { mockBookings } from '../data/mockData';
import BookingCard from '../components/BookingCard';

interface Booking {
  id: string;
  nannyId: string;
  parentId: string;
  nannyName: string;
  parentName: string;
  date: string;
  startTime: string;
  endTime: string;
  children: number;
  specialRequests?: string;
  hourlyRate: number;
  totalCost: number;
  status: 'pending' | 'accepted' | 'declined' | 'delivered';
  createdAt: string;
}

export default function MyBookings() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Get bookings from localStorage first, then fallback to mock data
    const storedBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const allBookings = storedBookings.length > 0 ? storedBookings : mockBookings;
    
    // Filter bookings for current parent
    const parentBookings = allBookings.filter((booking: Booking) => booking.parentId === user?.id);
    setBookings(parentBookings);
  }, [isAuthenticated, user, navigate]);

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const acceptedBookings = bookings.filter(b => b.status === 'accepted');
  const deliveredBookings = bookings.filter(b => b.status === 'delivered');
  const declinedBookings = bookings.filter(b => b.status === 'declined');

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 
              className="text-2xl font-bold text-green-600 cursor-pointer hover:text-green-700 transition-colors"
              onClick={() => navigate('/')}
            >
              DecsNanny
            </h1>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/nannies')}>
                Find Nannies
              </Button>
              <Button variant="ghost" onClick={() => navigate('/profile')}>
                <User className="w-4 h-4 mr-2" />
                {user?.name}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h2>
          <p className="text-gray-600">Track your childcare bookings and their status</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingBookings.length}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{acceptedBookings.length}</div>
              <div className="text-sm text-gray-600">Accepted</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{deliveredBookings.length}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{declinedBookings.length}</div>
              <div className="text-sm text-gray-600">Declined</div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {pendingBookings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Pending Bookings
                  <Badge variant="secondary">{pendingBookings.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} userType="parent" />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {acceptedBookings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Accepted Bookings
                  <Badge variant="secondary">{acceptedBookings.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {acceptedBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} userType="parent" />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {deliveredBookings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Completed Services
                  <Badge variant="secondary">{deliveredBookings.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deliveredBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} userType="parent" />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {declinedBookings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Declined Bookings
                  <Badge variant="secondary">{declinedBookings.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {declinedBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} userType="parent" />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {bookings.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-600 mb-4">
                  You haven't made any bookings yet. Start by browsing our amazing nannies!
                </p>
                <Button onClick={() => navigate('/nannies')} className="bg-green-600 hover:bg-green-700">
                  Find Nannies
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}