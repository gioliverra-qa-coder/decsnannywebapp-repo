import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Booking } from '../types';
import BookingCard from '../components/BookingCard';

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    // Load bookings from localStorage (in a real app, this would be from an API)
    const storedBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    setBookings(storedBookings);
  }, []);

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
            <h1 className="text-2xl font-bold text-blue-600">NannyBook</h1>
            <Button variant="ghost" onClick={() => navigate('/nannies')}>
              Find Nannies
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h2>
          <p className="text-gray-600">Manage your childcare appointments</p>
        </div>

        {bookings.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-700">No bookings yet</h3>
                <p className="text-gray-500">
                  You haven't made any bookings yet. Browse our nannies to get started!
                </p>
                <Button onClick={() => navigate('/nannies')} size="lg">
                  Browse Nannies
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Active Bookings */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Upcoming & Active Bookings</h3>
              <div className="grid gap-4">
                {bookings
                  .filter(booking => ['pending', 'confirmed'].includes(booking.status))
                  .map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
              </div>
              {bookings.filter(booking => ['pending', 'confirmed'].includes(booking.status)).length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">
                    No upcoming bookings
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Past Bookings */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Past Bookings</h3>
              <div className="grid gap-4">
                {bookings
                  .filter(booking => ['completed', 'cancelled'].includes(booking.status))
                  .map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
              </div>
              {bookings.filter(booking => ['completed', 'cancelled'].includes(booking.status)).length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">
                    No past bookings
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
              <Button onClick={() => navigate('/nannies')}>
                Book Another Nanny
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}