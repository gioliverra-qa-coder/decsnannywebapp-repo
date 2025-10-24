import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, CheckCircle, XCircle, Package, Star, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function MyBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch bookings for the logged-in parent
  const fetchBookings = async () => {
    if (!user) return;
    setLoading(true);

    const { data: parentRecord, error: parentError } = await supabase
      .from('parents')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (parentError || !parentRecord) {
      console.error('Parent profile not found:', parentError);
      setBookings([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('parent_id', parentRecord.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } else {
      setBookings(data);
    }

    setLoading(false);
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId);

    if (error) {
      toast.error('Failed to update booking status');
    } else {
      toast.success(`Booking marked as ${newStatus}`);
      fetchBookings();
    }
  };

  useEffect(() => {
    if (!user || user.userType !== 'parent') {
      navigate('/login');
      return;
    }

    fetchBookings();

    const subscription = supabase
      .channel('public:bookings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => fetchBookings()
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [user, navigate]);

  // Group bookings by status
  const groupedBookings: Record<string, any[]> = {
    pending: bookings.filter(b => b.status === 'pending'),
    accepted: bookings.filter(b => b.status === 'accepted'),
    completed: bookings.filter(b => b.status === 'completed'),
    paid: bookings.filter(b => b.status === 'paid'),
    declined: bookings.filter(b => b.status === 'declined'),
    cancelled: bookings.filter(b => b.status === 'cancelled'),
  };

  if (!user || user.userType !== 'parent') {
    return <div>Access denied. Please log in as a parent.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-600 cursor-pointer" onClick={() => navigate('/')}>
            DecsNanny
          </h1>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/nannies')}>Find Nannies</Button>
            <Button variant="ghost" onClick={() => navigate('/profile')}>
              <User className="w-4 h-4 mr-2" />
              {user?.name}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Track all your nanny booking requests and their status</p>
          <p className="text-sm text-gray-500 mt-2">Total bookings: {bookings.length}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          {Object.entries(groupedBookings).map(([status, list]) => {
            const colors: Record<string, string> = {
              pending: 'yellow',
              accepted: 'green',
              completed: 'blue',
              paid: 'purple',
              declined: 'red',
              cancelled: 'gray',
            };
            return (
              <Card key={status}>
                <CardHeader className="flex justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold text-${colors[status]}-600`}>
                    {list.length}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

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

        {/* Booking Lists */}
        {(['pending', 'accepted', 'completed', 'paid', 'declined', 'cancelled'] as const).map(status => {
          const list = groupedBookings[status];
          if (!list || list.length === 0) return null;
          const colors: Record<string, string> = {
            pending: 'yellow',
            accepted: 'green',
            completed: 'blue',
            paid: 'purple',
            declined: 'red',
            cancelled: 'gray',
          };

          return (
            <div key={status} className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                {status.charAt(0).toUpperCase() + status.slice(1)} Bookings
                <Badge className={`bg-${colors[status]}-100 text-${colors[status]}-800`}>
                  {list.length}
                </Badge>
              </h2>
              <div className="grid gap-4">
                {list.map(booking => (
                  <BookingCardInner
                    key={booking.id}
                    booking={booking}
                    onUpdateStatus={handleStatusUpdate}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Inner BookingCard component with Cancel & Rebook buttons
function BookingCardInner({
  booking,
  onUpdateStatus,
}: {
  booking: any;
  onUpdateStatus: (id: string, status: string) => void;
}) {
  const navigate = useNavigate();

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      onUpdateStatus(booking.id, 'cancelled');
    }
  };

  const handleRebook = () => {
    navigate(`/booking/${booking.nanny_id}`);
  };

  return (
    <Card className="shadow">
      <CardHeader className="flex justify-between items-center">
        <CardTitle>{booking.nanny_name}</CardTitle>
        <Badge
          className={`${
            booking.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : booking.status === 'accepted'
              ? 'bg-green-100 text-green-800'
              : booking.status === 'completed'
              ? 'bg-blue-100 text-blue-800'
              : booking.status === 'paid'
              ? 'bg-purple-100 text-purple-800'
              : booking.status === 'declined'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {booking.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <p>Date: {booking.date}</p>
        <p>Start Time: {booking.start_time}</p>
        <p>End Time: {booking.end_time}</p>
        <p>Duration: {booking.duration} hr(s)</p>
        <p>Total: ${booking.total_amount}</p>
        {booking.special_instructions && <p>Notes: {booking.special_instructions}</p>}

        <div className="flex gap-2 mt-4 flex-wrap">
          {(booking.status === 'pending' || booking.status === 'accepted') && (
            <Button size="sm" variant="destructive" onClick={handleCancel}>
              Cancel Booking
            </Button>
          )}
          {booking.status === 'completed' && (
            <Button size="sm" variant="secondary" onClick={handleRebook}>
              Rebook
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
