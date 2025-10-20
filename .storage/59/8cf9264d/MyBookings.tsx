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

  const loadBookings = () => {
    // Load bookings from localStorage (in a real app, this would be from an API)
    const storedBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    
    // Filter bookings based on user type
    let filteredBookings = storedBookings;
    
    if (user?.userType === 'parent') {
      // For parents, show ALL bookings they created - match by multiple criteria to ensure we catch all
      filteredBookings = storedBookings.filter((booking: Booking) => 
        // Match by contact info in the booking
        booking.userContact.name === user.name || 
        booking.userContact.email === user.email ||
        // Match by creator ID if available
        booking.createdBy === user.id ||
        booking.createdByEmail === user.email ||
        // Additional fallback - match by current user's email/name
        (booking.userContact.name && booking.userContact.name.toLowerCase() === user.name.toLowerCase()) ||
        (booking.userContact.email && booking.userContact.email.toLowerCase() === user.email.toLowerCase())
      );
    } else if (user?.userType === 'nanny') {
      // For nannies, only show bookings where they are the selected nanny
      filteredBookings = storedBookings.filter((booking: Booking) => 
        booking.nannyName === user.name || 
        booking.nannyId && booking.nannyName.toLowerCase().includes(user.name.toLowerCase())
      );
    }
    
    // Sort bookings by creation date (newest first)
    filteredBookings.sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime());
    
    setBookings(filteredBookings);
  };

  useEffect(() => {
    loadBookings();

    // Listen for booking status updates from other tabs/users
    const handleBookingUpdate = (event: CustomEvent) => {
      console.log('Booking status updated:', event.detail);
      // Reload bookings when status changes
      setTimeout(loadBookings, 100); // Small delay to ensure localStorage is updated
    };

    // Listen for localStorage changes (cross-tab synchronization)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'bookings') {
        console.log('Bookings updated in localStorage');
        loadBookings();
      }
    };

    // Add event listeners
    window.addEventListener('bookingStatusUpdated', handleBookingUpdate as EventListener);
    window.addEventListener('storage', handleStorageChange);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('bookingStatusUpdated', handleBookingUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
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
            {user.userType === 'nanny' ? 'My Booking Requests' : 'All My Bookings'}
          </h2>
          <p className="text-gray-600">
            {user.userType === 'nanny' 
              ? 'Manage booking requests from families'
              : `Complete history of all ${bookings.length} booking${bookings.length !== 1 ? 's' : ''} you've created`
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
            {/* All Bookings for Parents */}
            {user.userType === 'parent' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">All Bookings ({bookings.length})</h3>
                <div className="grid gap-4">
                  {bookings.map((booking) => (
                    <BookingCard 
                      key={booking.id} 
                      booking={booking} 
                      userType={user.userType}
                      onStatusUpdate={loadBookings}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Nanny view - separate active and past */}
            {user.userType === 'nanny' && (
              <>
                {/* Active Bookings */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Pending & Confirmed Requests</h3>
                  <div className="grid gap-4">
                    {bookings
                      .filter(booking => ['pending', 'confirmed'].includes(booking.status))
                      .map((booking) => (
                        <BookingCard 
                          key={booking.id} 
                          booking={booking} 
                          userType={user.userType}
                          onStatusUpdate={loadBookings}
                        />
                      ))}
                  </div>
                  {bookings.filter(booking => ['pending', 'confirmed'].includes(booking.status)).length === 0 && (
                    <Card>
                      <CardContent className="p-6 text-center text-gray-500">
                        No pending requests
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Past Bookings */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Past Requests</h3>
                  <div className="grid gap-4">
                    {bookings
                      .filter(booking => ['completed', 'cancelled'].includes(booking.status))
                      .map((booking) => (
                        <BookingCard 
                          key={booking.id} 
                          booking={booking} 
                          userType={user.userType}
                          onStatusUpdate={loadBookings}
                        />
                      ))}
                  </div>
                  {bookings.filter(booking => ['completed', 'cancelled'].includes(booking.status)).length === 0 && (
                    <Card>
                      <CardContent className="p-6 text-center text-gray-500">
                        No past requests
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            )}
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