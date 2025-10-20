import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Users, Star, User } from 'lucide-react';
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

export default function NannyDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!isAuthenticated || user?.userType !== 'nanny') {
      navigate('/login');
      return;
    }

    // Get bookings from localStorage first, then fallback to mock data
    const storedBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const allBookings = storedBookings.length > 0 ? storedBookings : mockBookings;
    
    // Filter bookings for current nanny (use nanny ID '1' for demo nanny)
    const nannyId = user.id === 'nanny-demo' ? '1' : user.id;
    const nannyBookings = allBookings.filter((booking: Booking) => booking.nannyId === nannyId);
    setBookings(nannyBookings);
  }, [isAuthenticated, user, navigate]);

  const handleAcceptBooking = (bookingId: string) => {
    const updatedBookings = bookings.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: 'accepted' as const }
        : booking
    );
    setBookings(updatedBookings);
    
    // Update localStorage
    const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const updatedAllBookings = allBookings.map((booking: Booking) => 
      booking.id === bookingId 
        ? { ...booking, status: 'accepted' as const }
        : booking
    );
    localStorage.setItem('bookings', JSON.stringify(updatedAllBookings));
  };

  const handleDeclineBooking = (bookingId: string) => {
    const updatedBookings = bookings.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: 'declined' as const }
        : booking
    );
    setBookings(updatedBookings);
    
    // Update localStorage
    const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const updatedAllBookings = allBookings.map((booking: Booking) => 
      booking.id === bookingId 
        ? { ...booking, status: 'declined' as const }
        : booking
    );
    localStorage.setItem('bookings', JSON.stringify(updatedAllBookings));
  };

  const handleMarkDelivered = (bookingId: string) => {
    const updatedBookings = bookings.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: 'delivered' as const }
        : booking
    );
    setBookings(updatedBookings);
    
    // Update localStorage
    const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const updatedAllBookings = allBookings.map((booking: Booking) => 
      booking.id === bookingId 
        ? { ...booking, status: 'delivered' as const }
        : booking
    );
    localStorage.setItem('bookings', JSON.stringify(updatedAllBookings));
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const acceptedBookings = bookings.filter(b => b.status === 'accepted');
  const deliveredBookings = bookings.filter(b => b.status === 'delivered');
  const totalEarnings = deliveredBookings.reduce((sum, booking) => sum + booking.totalCost, 0);

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}!
          </h2>
          <p className="text-gray-600">Manage your bookings and track your earnings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingBookings.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Accepted Bookings</p>
                  <p className="text-2xl font-bold text-green-600">{acceptedBookings.length}</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Services</p>
                  <p className="text-2xl font-bold text-blue-600">{deliveredBookings.length}</p>
                </div>
                <Star className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-emerald-600">${totalEarnings}</p>
                </div>
                <DollarSign className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Requests */}
        <div className="space-y-6">
          {pendingBookings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Pending Requests
                  <Badge variant="secondary">{pendingBookings.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {pendingBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onAccept={handleAcceptBooking}
                      onDecline={handleDeclineBooking}
                      userType="nanny"
                    />
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
                <div className="grid gap-4">
                  {acceptedBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onMarkDelivered={handleMarkDelivered}
                      userType="nanny"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {deliveredBookings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Completed Services
                  <Badge variant="secondary">{deliveredBookings.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {deliveredBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      userType="nanny"
                    />
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
                <p className="text-gray-600">
                  Your booking requests will appear here once families start booking your services.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}