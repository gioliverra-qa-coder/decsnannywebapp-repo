// src/pages/MyBookings.tsx
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, CheckCircle, XCircle, Package, Star, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function MyBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('parent_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } else {
      setBookings(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user || user.userType !== 'parent') {
      navigate('/login');
      return;
    }

    fetchBookings();

    // Subscribe to live updates for this parent
    const subscription = supabase
      .channel(`public:bookings:parent_id=eq.${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `parent_id=eq.${user.id}` },
        payload => {
          console.log('Realtime booking update:', payload);
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, navigate]);

  // Compute stats dynamically from bookings
  const stats = useMemo(() => {
    return {
      pending: bookings.filter(b => b.status === 'pending').length,
      accepted: bookings.filter(b => b.status === 'accepted').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      delivered: bookings.filter(b => b.status === 'delivered').length,
      declined: bookings.filter(b => b.status === 'declined').length,
    };
  }, [bookings]);

  if (!user || user.userType !== 'parent') {
    return <div>Access denied. Please log in as a parent.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-600 cursor-pointer" onClick={() => navigate('/')}>DecsNanny
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
      </header>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Track all your nanny booking requests and their status</p>
          <p className="text-sm text-gray-500 mt-2">
            User ID: {user.id} | Total bookings found: {bookings.length}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Accepted</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Star className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <Package className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.delivered}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Declined</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.declined}</div>
            </CardContent>
          </Card>
        </div>

        {/* Booking List */}
        {loading && <p className="text-center">Loading bookings...</p>}

        {!loading && bookings.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600 mb-6">
                Start by browsing our trusted nannies and make your first booking.
              </p>
              <Button onClick={() => navigate('/nannies')}>Find Nannies</Button>
            </CardContent>
          </Card>
        )}

        {!loading && bookings.length > 0 && bookings.map(booking => (
          <Card key={booking.id} className="mb-4 shadow">
            <CardHeader>
              <CardTitle>{booking.nanny_name}</CardTitle>
              <Badge className={`${
                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                booking.status === 'accepted' ? 'bg-green-100 text-green-800' :
                booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                booking.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
                'bg-red-100 text-red-800'
              }`}>
                {booking.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <p>Date: {booking.date}</p>
              <p>Start Time: {booking.start_time}</p>
              <p>End Time: {booking.end_time}</p>
              <p>Duration: {booking.hours || booking.duration} hr(s)</p>
              <p>Total: ${booking.total_amount || booking.hours * booking.hourlyrate}</p>
              {booking.special_instructions && <p>Notes: {booking.special_instructions}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
