// src/pages/NannyDashboard.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, Star, Clock, Package, User, XCircle, Ban } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';
import BookingCard from '../components/BookingCard';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function NannyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Fetch bookings for nanny
  const fetchBookings = async () => {
    if (!user) return;
    setLoading(true);

    const { data: nannyRecord, error: nannyError } = await supabase
      .from('nannies')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (nannyError || !nannyRecord) {
      console.error('Nanny profile not found', nannyError);
      setBookings([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        date,
        start_time,
        end_time,
        total_amount,
        duration,
        hourlyrate,
        special_instructions,
        status,
        parent:parents (
          name,
          children
        )
      `)
      .eq('nanny_id', nannyRecord.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } else {
      const mappedBookings = data.map((b) => ({
        ...b,
        parentName: b.parent?.name || 'Unknown Parent',
        children: b.parent?.children || [],
      }));
      setBookings(mappedBookings);
    }

    setLoading(false);
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', bookingId);
    if (error) {
      toast.error('Failed to update booking status');
    } else {
      toast.success(`Booking marked as ${status}`);
      fetchBookings();
    }
  };

  useEffect(() => {
    if (!user || user.userType !== 'nanny') {
      navigate('/login');
      return;
    }

    fetchBookings();

    const subscription = supabase
      .channel('public:bookings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `nanny_id=eq.${user.id}` },
        () => fetchBookings()
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [user, navigate]);

  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const acceptedBookings = bookings.filter((b) => b.status === 'accepted');
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const paidBookings = bookings.filter((b) => b.status === 'paid');
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');
  const declinedBookings = bookings.filter((b) => b.status === 'declined');
  const totalEarnings = paidBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);

  if (!user || user.userType !== 'nanny')
    return <div>Access denied. Please log in as a nanny.</div>;

  // Define highlight color per status
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-50 border-yellow-500',
    accepted: 'bg-green-50 border-green-500',
    completed: 'bg-blue-50 border-blue-500',
    paid: 'bg-purple-50 border-purple-500',
    cancelled: 'bg-red-50 border-red-500',
    declined: 'bg-orange-50 border-orange-500',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
          <h1
            className="text-2xl font-bold text-green-600 cursor-pointer hover:text-green-700 transition-colors"
            onClick={() => navigate('/')}
          >
            DecsNanny
          </h1>
          <div className="flex items-center flex-wrap justify-center gap-2 sm:gap-4">
            <Button variant="ghost" onClick={() => navigate('/profile')} size="sm">
              <User className="w-4 h-4 mr-2" />
              {user?.name}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
        {/* Welcome Section */}
        <div className="mb-6 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage your bookings and track your earnings
          </p>
        </div>

        {/* Stats Grid with Enhanced Clickable Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 mb-8">
          {[
            { title: 'Pending', value: pendingBookings.length, color: 'text-yellow-600', icon: Clock, key: 'pending', clickable: true },
            { title: 'Accepted', value: acceptedBookings.length, color: 'text-green-600', icon: Calendar, key: 'accepted', clickable: true },
            { title: 'Completed', value: completedBookings.length, color: 'text-blue-600', icon: Star, key: 'completed', clickable: true },
            { title: 'Paid', value: paidBookings.length, color: 'text-purple-600', icon: Package, key: 'paid', clickable: true },
            { title: 'Declined by Nanny', value: declinedBookings.length, color: 'text-orange-600', icon: Ban, key: 'declined', clickable: true },
            { title: 'Cancelled by Parent', value: cancelledBookings.length, color: 'text-red-600', icon: XCircle, key: 'cancelled', clickable: true },
            { title: 'Earnings', value: `$${totalEarnings}`, color: 'text-emerald-600', icon: DollarSign, key: 'earnings', clickable: false },
          ].map(({ title, value, color, icon: Icon, key, clickable }) => (
            <Card
              key={key}
              onClick={clickable ? () => setSelectedStatus(selectedStatus === key ? null : key) : undefined}
              className={`transition-all ${
                clickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'
              } ${
                selectedStatus === key
                  ? `${statusColors[key]} border-2 shadow-lg`
                  : 'bg-white'
              }`}
            >
              <CardHeader className="flex justify-between pb-1">
                <CardTitle className="text-xs sm:text-sm font-medium">{title}</CardTitle>
                <Icon className={`h-4 w-4 ${color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-lg sm:text-2xl font-bold ${color}`}>{value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtered Bookings */}
        <section className="mb-10">
          <div className="flex flex-wrap justify-between items-center mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center gap-2">
              {selectedStatus
                ? `${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Bookings`
                : 'All Bookings'}
            </h2>

            {selectedStatus && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedStatus(null)}
                className="text-sm border-green-500 text-green-600 hover:bg-green-50 transition-colors"
              >
                Show All
              </Button>
            )}
          </div>

          <div className="grid gap-4 sm:gap-6">
            {(selectedStatus
              ? bookings.filter((b) => b.status === selectedStatus)
              : bookings
            ).map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onAccept={() => updateBookingStatus(booking.id, 'accepted')}
                onDecline={() => updateBookingStatus(booking.id, 'declined')}
                onMarkCompleted={() => updateBookingStatus(booking.id, 'completed')}
                onMarkPaid={() => updateBookingStatus(booking.id, 'paid')}
                onMarkDeclined={() => updateBookingStatus(booking.id, 'declined')}
                onMarkCancelled={() => updateBookingStatus(booking.id, 'cancelled')}
              />
            ))}
          </div>
        </section>

        {/* Empty State */}
        {!loading && bookings.length === 0 && (
          <Card className="text-center py-10 sm:py-12 mt-6">
            <CardContent>
              <Calendar className="w-14 h-14 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                No bookings yet
              </h3>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                When families book your services, they'll appear here for you to manage.
              </p>
              <Button onClick={() => navigate('/')} size="sm" className="sm:text-base">
                Back to Home
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
