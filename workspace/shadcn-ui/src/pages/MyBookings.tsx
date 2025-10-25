// src/pages/MyBookings.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Package, Star, XCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function MyBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch bookings for logged-in parent
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

    // Fetch bookings + join with nannies table
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        date,
        start_time,
        end_time,
        total_amount,
        duration,
        special_instructions,
        status,
        nanny:nannies (
          name
        )
      `)
      .eq('parent_id', parentRecord.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } else {
      const mapped = data.map((b) => ({
        ...b,
        nannyName: b.nanny?.name || 'Unknown Nanny',
      }));
      setBookings(mapped);
    }

    setLoading(false);
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId);
    if (error) toast.error('Failed to update booking status');
    else {
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => fetchBookings())
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [user, navigate]);

  // Group by status
  const groupedBookings: Record<string, any[]> = {
    pending: bookings.filter((b) => b.status === 'pending'),
    accepted: bookings.filter((b) => b.status === 'accepted'),
    completed: bookings.filter((b) => b.status === 'completed'),
    paid: bookings.filter((b) => b.status === 'paid'),
    declined: bookings.filter((b) => b.status === 'declined'),
    cancelled: bookings.filter((b) => b.status === 'cancelled'),
  };

  if (!user || user.userType !== 'parent') return <div>Access denied. Please log in as a parent.</div>;

  const colorMap: Record<string, string> = {
    pending: 'yellow',
    accepted: 'green',
    completed: 'blue',
    paid: 'purple',
    declined: 'red',
    cancelled: 'gray',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1
            className="text-2xl font-bold text-green-600 cursor-pointer hover:text-green-700 transition-colors"
            onClick={() => navigate('/')}>
            DecsNanny
          </h1>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/nannies')}>
              Find Nannies
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Info */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Track all your nanny bookings and their progress</p>
          <p className="text-sm text-gray-500 mt-2">Total bookings: {bookings.length}</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {Object.entries(groupedBookings).map(([status, list]) => (
            <Card key={status} className="text-center">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-medium capitalize">{status}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold text-${colorMap[status]}-600`}>{list.length}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading State */}
        {loading && <p className="text-center text-gray-600">Loading bookings...</p>}

        {/* Empty State */}
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

        {/* Bookings by Status */}
        {Object.entries(groupedBookings).map(([status, list]) =>
          list.length > 0 ? (
            <section key={status} className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                {status.charAt(0).toUpperCase() + status.slice(1)} Bookings
                <Badge className={`bg-${colorMap[status]}-100 text-${colorMap[status]}-800`}>
                  {list.length}
                </Badge>
              </h2>
              <div className="grid gap-4">
                {list.map((booking) => (
                  <BookingCardInner
                    key={booking.id}
                    booking={booking}
                    onUpdateStatus={handleStatusUpdate}
                  />
                ))}
              </div>
            </section>
          ) : null
        )}
      </main>
    </div>
  );
}

// Booking Card Inner
function BookingCardInner({
  booking,
  onUpdateStatus,
}: {
  booking: any;
  onUpdateStatus: (id: string, status: string) => void;
}) {
  const navigate = useNavigate();

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this booking?')) onUpdateStatus(booking.id, 'cancelled');
  };

  const handleRebook = () => navigate(`/booking/${booking.nanny_id}`);

  const icons: Record<string, JSX.Element> = {
    pending: <Clock className="w-4 h-4" />,
    accepted: <CheckCircle className="w-4 h-4" />,
    completed: <Star className="w-4 h-4" />,
    paid: <Package className="w-4 h-4" />,
    declined: <XCircle className="w-4 h-4" />,
    cancelled: <XCircle className="w-4 h-4" />,
  };

  const colorMap: Record<string, string> = {
    pending: 'yellow',
    accepted: 'green',
    completed: 'blue',
    paid: 'purple',
    declined: 'red',
    cancelled: 'gray',
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 flex flex-col sm:flex-row justify-between gap-2 sm:items-start">
        <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">
          Booking with {booking.nannyName}
        </CardTitle>
        <Badge
          className={`flex items-center gap-1 bg-${colorMap[booking.status]}-100 text-${colorMap[booking.status]}-800`}
        >
          {icons[booking.status]}
          <span className="capitalize text-xs sm:text-sm">{booking.status}</span>
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3 text-sm sm:text-base">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>{booking.date}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>
              {booking.start_time} - {booking.end_time}
            </span>
          </div>
        </div>

        <p className="text-gray-700">Duration: {booking.duration} hr(s)</p>
        <p className="font-semibold text-gray-900">Total: ${booking.total_amount}</p>

        {booking.special_instructions && (
          <div className="bg-gray-50 p-2 sm:p-3 rounded text-gray-600">
            <span className="font-medium">Notes:</span> {booking.special_instructions}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          {(booking.status === 'pending' || booking.status === 'accepted') && (
            <Button
              size="sm"
              variant="destructive"
              onClick={handleCancel}
              className="w-full sm:w-auto flex-1"
            >
              Cancel Booking
            </Button>
          )}
          {booking.status === 'completed' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleRebook}
              className="w-full sm:w-auto flex-1"
            >
              Rebook
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}