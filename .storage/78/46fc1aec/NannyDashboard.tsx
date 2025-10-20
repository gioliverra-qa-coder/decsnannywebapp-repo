import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, Star, Clock, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Booking } from '../types/user';
import BookingCard from '../components/BookingCard';
import { useNavigate } from 'react-router-dom';

export default function NannyDashboard() {
  const { user, updateBookingStatus } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!user || user.userType !== 'nanny') {
      navigate('/login');
      return;
    }

    // Get bookings for this nanny from localStorage
    const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const nannyBookings = allBookings.filter((booking: Booking) => booking.nannyId === user.id);
    setBookings(nannyBookings);
  }, [user, navigate]);

  const handleAcceptBooking = (bookingId: string) => {
    updateBookingStatus(bookingId, 'accepted');
    // Update local state
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: 'accepted' as const }
        : booking
    ));
  };

  const handleDeclineBooking = (bookingId: string) => {
    updateBookingStatus(bookingId, 'declined');
    // Update local state
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: 'declined' as const }
        : booking
    ));
  };

  const handleMarkDelivered = (bookingId: string) => {
    updateBookingStatus(bookingId, 'delivered');
    // Update local state
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: 'delivered' as const }
        : booking
    ));
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const acceptedBookings = bookings.filter(b => b.status === 'accepted');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const deliveredBookings = bookings.filter(b => b.status === 'delivered');
  const totalEarnings = bookings
    .filter(b => b.status === 'delivered')
    .reduce((sum, booking) => sum + booking.totalAmount, 0);

  if (!user || user.userType !== 'nanny') {
    return <div>Access denied. Please log in as a nanny.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600">Manage your bookings and track your earnings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingBookings.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accepted Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{acceptedBookings.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered Services</CardTitle>
              <Package className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{deliveredBookings.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">${totalEarnings}</div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests */}
        {pendingBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-yellow-600" />
              Pending Requests
              <Badge className="bg-yellow-100 text-yellow-800">{pendingBookings.length}</Badge>
            </h2>
            <div className="grid gap-4">
              {pendingBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onAccept={handleAcceptBooking}
                  onDecline={handleDeclineBooking}
                />
              ))}
            </div>
          </div>
        )}

        {/* Accepted Bookings */}
        {acceptedBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-green-600" />
              Accepted Bookings
              <Badge className="bg-green-100 text-green-800">{acceptedBookings.length}</Badge>
            </h2>
            <div className="grid gap-4">
              {acceptedBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          </div>
        )}

        {/* Completed Bookings (Ready to Mark as Delivered) */}
        {completedBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-6 h-6 text-blue-600" />
              Completed - Ready for Delivery
              <Badge className="bg-blue-100 text-blue-800">{completedBookings.length}</Badge>
            </h2>
            <div className="grid gap-4">
              {completedBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onMarkDelivered={handleMarkDelivered}
                />
              ))}
            </div>
          </div>
        )}

        {/* Delivered Services */}
        {deliveredBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-6 h-6 text-purple-600" />
              Delivered Services
              <Badge className="bg-purple-100 text-purple-800">{deliveredBookings.length}</Badge>
            </h2>
            <div className="grid gap-4">
              {deliveredBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          </div>
        )}

        {bookings.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600 mb-6">
                When families book your services, they'll appear here for you to manage.
              </p>
              <Button onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}