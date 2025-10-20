import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, DollarSign, User, Phone, Mail, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Booking } from '../types';
import { mockNannies } from '../data/mockData';
import { toast } from 'sonner';

export default function NannyDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [myBookings, setMyBookings] = useState<Booking[]>([]);

  const loadBookings = () => {
    if (user?.userType === 'nanny') {
      // Load bookings from localStorage and filter for current nanny
      const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      
      // Find the nanny profile that matches the current user
      const nannyProfile = mockNannies.find(n => n.name === user.name);
      
      if (nannyProfile) {
        const nannyBookings = allBookings.filter((booking: Booking) => 
          booking.nannyId === nannyProfile.id || booking.nannyName === user.name
        );
        setMyBookings(nannyBookings);
      }
    }
  };

  useEffect(() => {
    loadBookings();

    // Listen for booking status updates
    const handleBookingUpdate = (event: CustomEvent) => {
      console.log('Nanny dashboard: Booking status updated:', event.detail);
      setTimeout(loadBookings, 100);
    };

    // Listen for localStorage changes (cross-tab synchronization)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'bookings') {
        console.log('Nanny dashboard: Bookings updated in localStorage');
        loadBookings();
      }
    };

    window.addEventListener('bookingStatusUpdated', handleBookingUpdate as EventListener);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('bookingStatusUpdated', handleBookingUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);

  const handleBookingAction = (bookingId: string, action: 'accept' | 'decline') => {
    const updatedBookings = myBookings.map(booking => 
      booking.id === bookingId 
        ? { 
            ...booking, 
            status: action === 'accept' ? 'confirmed' : 'cancelled',
            lastUpdated: new Date().toISOString(),
            updatedBy: 'nanny'
          }
        : booking
    );
    
    setMyBookings(updatedBookings);
    
    // Update localStorage
    const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const updatedAllBookings = allBookings.map((booking: Booking) => 
      booking.id === bookingId 
        ? { 
            ...booking, 
            status: action === 'accept' ? 'confirmed' : 'cancelled',
            lastUpdated: new Date().toISOString(),
            updatedBy: 'nanny'
          }
        : booking
    );
    localStorage.setItem('bookings', JSON.stringify(updatedAllBookings));

    // Trigger custom event for synchronization
    window.dispatchEvent(new CustomEvent('bookingStatusUpdated', {
      detail: { bookingId, newStatus: action === 'accept' ? 'confirmed' : 'cancelled', updatedBy: 'nanny' }
    }));

    toast.success(action === 'accept' ? 'Booking request accepted!' : 'Booking request declined.');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingBookings = myBookings.filter(b => b.status === 'pending');
  const upcomingBookings = myBookings.filter(b => b.status === 'confirmed');
  const pastBookings = myBookings.filter(b => ['completed', 'cancelled'].includes(b.status));

  const totalEarnings = myBookings
    .filter(b => b.status === 'completed')
    .reduce((sum, booking) => sum + booking.totalCost, 0);

  if (user?.userType !== 'nanny') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">This page is only accessible to nannies.</p>
            <Button onClick={() => navigate('/')}>
              Go to Home
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
            <Button variant="ghost" onClick={() => navigate('/profile')}>
              My Profile
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name}!</h2>
          <p className="text-gray-600">Manage your bookings and track your earnings (Real-time sync enabled)</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                  <p className="text-2xl font-bold">{pendingBookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming Jobs</p>
                  <p className="text-2xl font-bold">{upcomingBookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold">{myBookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold">${totalEarnings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests */}
        {pendingBookings.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Pending Booking Requests</h3>
            <div className="space-y-4">
              {pendingBookings.map((booking) => (
                <Card key={booking.id} className="border-yellow-200">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold">{booking.userContact.name}</h4>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
                            <p><strong>Time:</strong> {booking.time}</p>
                            <p><strong>Duration:</strong> {booking.duration} hours</p>
                          </div>
                          <div>
                            <p><strong>Email:</strong> {booking.userContact.email}</p>
                            <p><strong>Phone:</strong> {booking.userContact.phone}</p>
                            <p><strong>Total:</strong> ${booking.totalCost}</p>
                          </div>
                        </div>
                        {booking.specialRequirements && (
                          <div className="mt-3">
                            <p className="text-sm"><strong>Special Requirements:</strong></p>
                            <p className="text-sm text-gray-600">{booking.specialRequirements}</p>
                          </div>
                        )}
                        {booking.lastUpdated && (
                          <p className="text-xs text-gray-500 mt-2">
                            Last updated: {new Date(booking.lastUpdated).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button 
                          onClick={() => handleBookingAction(booking.id, 'accept')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Accept
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleBookingAction(booking.id, 'decline')}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Bookings */}
        {upcomingBookings.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Upcoming Bookings</h3>
            <div className="grid gap-4">
              {upcomingBookings.map((booking) => (
                <Card key={booking.id} className="border-green-200">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold">{booking.userContact.name}</h4>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
                            <p><strong>Time:</strong> {booking.time}</p>
                            <p><strong>Duration:</strong> {booking.duration} hours</p>
                          </div>
                          <div>
                            <p><strong>Phone:</strong> {booking.userContact.phone}</p>
                            <p><strong>Total:</strong> ${booking.totalCost}</p>
                          </div>
                        </div>
                        {booking.lastUpdated && (
                          <p className="text-xs text-gray-500 mt-2">
                            Confirmed: {new Date(booking.lastUpdated).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Past Bookings */}
        {pastBookings.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Past Bookings</h3>
            <div className="grid gap-4">
              {pastBookings.slice(0, 5).map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold">{booking.userContact.name}</h4>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(booking.date).toLocaleDateString()} • {booking.duration} hours • ${booking.totalCost}
                        </p>
                        {booking.lastUpdated && (
                          <p className="text-xs text-gray-500">
                            Updated: {new Date(booking.lastUpdated).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {myBookings.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-700">No bookings yet</h3>
                <p className="text-gray-500">
                  When families book your services, you'll see their requests here.
                </p>
                <Button onClick={() => navigate('/profile')} className="bg-green-600 hover:bg-green-700">
                  Complete Your Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}