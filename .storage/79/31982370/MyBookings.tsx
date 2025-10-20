import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, CheckCircle, XCircle, Package, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Booking } from '../types/user';
import BookingCard from '../components/BookingCard';
import { useNavigate } from 'react-router-dom';

export default function MyBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!user || user.userType !== 'parent') {
      navigate('/login');
      return;
    }

    // Get bookings for this parent from localStorage
    const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const parentBookings = allBookings.filter((booking: Booking) => booking.parentId === user.id);
    setBookings(parentBookings);
  }, [user, navigate]);

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const acceptedBookings = bookings.filter(b => b.status === 'accepted');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const deliveredBookings = bookings.filter(b => b.status === 'delivered');
  const declinedBookings = bookings.filter(b => b.status === 'declined');

  if (!user || user.userType !== 'parent') {
    return <div>Access denied. Please log in as a parent.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Track all your nanny booking requests and their status</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingBookings.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accepted</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{acceptedBookings.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Star className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{completedBookings.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <Package className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{deliveredBookings.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Declined</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{declinedBookings.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Bookings */}
        {pendingBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-yellow-600" />
              Pending Requests
              <Badge className="bg-yellow-100 text-yellow-800">{pendingBookings.length}</Badge>
            </h2>
            <div className="grid gap-4">
              {pendingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          </div>
        )}

        {/* Accepted Bookings */}
        {acceptedBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
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

        {/* Completed Bookings */}
        {completedBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-6 h-6 text-blue-600" />
              Completed Services
              <Badge className="bg-blue-100 text-blue-800">{completedBookings.length}</Badge>
            </h2>
            <div className="grid gap-4">
              {completedBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          </div>
        )}

        {/* Delivered Services */}
        {deliveredBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibent text-gray-900 mb-4 flex items-center gap-2">
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

        {/* Declined Bookings */}
        {declinedBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <XCircle className="w-6 h-6 text-red-600" />
              Declined Requests
              <Badge className="bg-red-100 text-red-800">{declinedBookings.length}</Badge>
            </h2>
            <div className="grid gap-4">
              {declinedBookings.map((booking) => (
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
                Start by browsing our trusted nannies and make your first booking.
              </p>
              <Button onClick={() => navigate('/nannies')}>
                Find Nannies
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}