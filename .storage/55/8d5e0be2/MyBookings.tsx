import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Booking } from '../types';
import BookingCard from '../components/BookingCard';
import { useAuth } from '../contexts/AuthContext';

export default function MyBookings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    // Load bookings from localStorage (in a real app, this would be from an API)
    const storedBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    
    // Filter bookings based on user type
    let filteredBookings = storedBookings;
    
    if (user?.userType === 'nanny') {
      // For nannies, only show bookings where they are the selected nanny
      // Match by nanny name since we don't have perfect nanny IDs in the current system
      filteredBookings = storedBookings.filter((booking: Booking) => 
        booking.nannyName === user.name || 
        // Also check if the booking is for a nanny with the same name from mockData
        booking.nannyId && booking.nannyName.toLowerCase().includes(user.name.toLowerCase())
      );
    } else if (user?.userType === 'parent') {
      // For parents, show bookings they created (match by contact info)
      filteredBookings = storedBookings.filter((booking: Booking) => 
        booking.userContact.email === user.email ||
        booking.userContact.name === user.name ||
        booking.createdBy === user.id
      );
    }
    // If no user or guest, show all bookings (fallback)
    
    setBookings(filteredBookings);
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Please log in</h2>
            <Button onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-2xl font-bold text-green-600">Dec'sNanny</h1>
            <Button variant="ghost" onClick={() => navigate('/nannies')}>
              {user.userType === 'parent' ? 'Find Nannies' : 'Browse Nannies'}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {user.userType === 'nanny' ? 'My Booking Requests' : 'My Bookings'}
          </h2>
          <p className="text-gray-600">
            {user.userType === 'nanny' 
              ? 'Manage booking requests from families'
              : 'Manage your childcare appointments'
            }
          </p>
        </div>

        {bookings.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-700">
                  {user.userType === 'nanny' ? 'No booking requests yet' : 'No bookings yet'}
                </h3>
                <p className="text-gray-500">
                  {user.userType === 'nanny' 
                    ? 'When families book your services, their requests will appear here.'
                    : 'You haven\'t made any bookings yet. Browse our nannies to get started!'
                  }
                </p>
                {user.userType === 'parent' && (
                  <Button onClick={() => navigate('/nannies')} size="lg" className="bg-green-600 hover:bg-green-700">
                    Browse Nannies
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Active Bookings */}
            <div>
              <h3 className="text-xl font-semibold mb-4">
                {user.userType === 'nanny' ? 'Pending & Confirmed Requests' : 'Upcoming & Active Bookings'}
              </h3>
              <div className="grid gap-4">
                {bookings
                  .filter(booking => ['pending', 'confirmed'].includes(booking.status))
                  .map((booking) => (
                    <BookingCard key={booking.id} booking={booking} userType={user.userType} />
                  ))}
              </div>
              {bookings.filter(booking => ['pending', 'confirmed'].includes(booking.status)).length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">
                    {user.userType === 'nanny' ? 'No pending requests' : 'No upcoming bookings'}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Past Bookings */}
            <div>
              <h3 className="text-xl font-semibold mb-4">
                {user.userType === 'nanny' ? 'Past Requests' : 'Past Bookings'}
              </h3>
              <div className="grid gap-4">
                {bookings
                  .filter(booking => ['completed', 'cancelled'].includes(booking.status))
                  .map((booking) => (
                    <BookingCard key={booking.id} booking={booking} userType={user.userType} />
                  ))}
              </div>
              {bookings.filter(booking => ['completed', 'cancelled'].includes(booking.status)).length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">
                    {user.userType === 'nanny' ? 'No past requests' : 'No past bookings'}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {user.userType === 'parent' ? (
                <>
                  <Button onClick={() => navigate('/nannies')} className="bg-green-600 hover:bg-green-700">
                    Book Another Nanny
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/')}>
                    Back to Home
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => navigate('/profile')} className="bg-green-600 hover:bg-green-700">
                    Update Profile
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/')}>
                    Back to Home
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}