import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, Star, Clock, Package, User } from 'lucide-react';
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

  // Fetch bookings from Supabase for the logged-in nanny
  const fetchBookings = async () => {
    if (!user) return;

    setLoading(true);

    // 1️⃣ Get the nanny record (to match the correct nanny_id)
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

    // 2️⃣ Fetch bookings + join with parents table (get parent name and children)
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
      // 3️⃣ Map parent name and children for easier access
      const mappedBookings = data.map((b) => ({
        ...b,
        parentName: b.parent?.name || 'Unknown Parent',
        children: b.parent?.children || [],
      }));
      setBookings(mappedBookings);
    }

    setLoading(false);
  };

  // Update booking status
  const updateBookingStatus = async (bookingId: string, status: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

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

    // Realtime updates
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

  // Categorize bookings
  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const acceptedBookings = bookings.filter((b) => b.status === 'accepted');
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const paidBookings = bookings.filter((b) => b.status === 'paid');
  const totalEarnings = paidBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);

  if (!user || user.userType !== 'nanny')
    return <div>Access denied. Please log in as a nanny.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1
            className="text-2xl font-bold text-green-600 cursor-pointer hover:text-green-700 transition-colors"
            onClick={() => navigate('/')}
          >
            DecsNanny
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
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600">Manage your bookings and track your earnings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {pendingBookings.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Accepted Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {acceptedBookings.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed Services</CardTitle>
              <Star className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {completedBookings.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Paid Services</CardTitle>
              <Package className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {paidBookings.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                ${totalEarnings}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings by Status */}
        {[
          { title: 'Pending Requests', list: pendingBookings, icon: Clock, action: 'pending' },
          { title: 'Accepted Bookings', list: acceptedBookings, icon: Calendar, action: 'accepted' },
          { title: 'Completed - Ready for Payment', list: completedBookings, icon: Star, action: 'completed' },
          { title: 'Paid Services', list: paidBookings, icon: Package, action: 'paid' },
        ].map(({ title, list, icon: Icon, action }) =>
          list.length > 0 ? (
            <div key={action} className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Icon className="w-6 h-6 text-gray-700" />
                {title}
                <Badge className="bg-gray-100 text-gray-800">{list.length}</Badge>
              </h2>
              <div className="grid gap-4">
                {list.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onAccept={() => updateBookingStatus(booking.id, 'accepted')}
                    onDecline={() => updateBookingStatus(booking.id, 'declined')}
                    onMarkCompleted={() => updateBookingStatus(booking.id, 'completed')}
                    onMarkPaid={() => updateBookingStatus(booking.id, 'paid')}
                  />
                ))}
              </div>
            </div>
          ) : null
        )}

        {/* Empty State */}
        {bookings.length === 0 && !loading && (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No bookings yet
              </h3>
              <p className="text-gray-600 mb-6">
                When families book your services, they'll appear here for you to manage.
              </p>
              <Button onClick={() => navigate('/')}>Back to Home</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
