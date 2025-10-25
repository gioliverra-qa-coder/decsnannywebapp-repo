import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export default function BookingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [nanny, setNanny] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    date: undefined as Date | undefined,
    time: '',
    duration: '',
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    specialRequirements: ''
  });

  // Redirect non-authenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.userType !== 'parent') {
      toast.error('Only parents can create bookings');
      navigate('/');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch the nanny from Supabase
  useEffect(() => {
    async function fetchNanny() {
      setLoading(true);
      const { data, error } = await supabase
        .from('nannies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching nanny:', error);
        toast.error('Failed to fetch nanny info');
        navigate('/nannies');
      } else {
        setNanny(data);
      }
      setLoading(false);
    }

    fetchNanny();
  }, [id, navigate]);

  useEffect(() => {
    async function fetchParentInfo() {
      if (!user) return;
      const { data } = await supabase
        .from('parents')
        .select('name, email, phone')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setFormData((prev) => ({
          ...prev,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
        }));
      }
    }

    fetchParentInfo();
  }, [user]);

  if (!nanny) {
    return loading ? (
      <p className="text-center mt-10">Loading nanny details...</p>
    ) : (
      <Card className="text-center py-12 mx-auto mt-10 max-w-md">
        <CardContent>
          <h2 className="text-2xl font-bold mb-4">Nanny Not Found</h2>
          <Button onClick={() => navigate('/nannies')}>Back to Nanny List</Button>
        </CardContent>
      </Card>
    );
  }

  const totalCost = formData.duration ? parseInt(formData.duration) * nanny.hourlyrate : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.date ||
      !formData.time ||
      !formData.duration ||
      !formData.name ||
      !formData.email ||
      !formData.phone
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      // 🧩 1️⃣ Get the parent record (since parent_id references parents.id)
      const { data: parentRecord, error: parentError } = await supabase
        .from('parents')
        .select('id, name')
        .eq('user_id', user.id)
        .single();

      if (parentError || !parentRecord) {
        toast.error('Parent profile not found');
        setSubmitting(false);
        return;
      }

      // 🧩 2️⃣ Calculate time range
      const startTime = formData.time;
      const endHour = parseInt(startTime.split(':')[0]) + parseInt(formData.duration);
      const endTime = `${endHour.toString().padStart(2, '0')}:${startTime.split(':')[1]}`;
      const bookingDate = format(formData.date, 'yyyy-MM-dd');

      // 🧩 3️⃣ Check for existing overlapping bookings for this nanny
      const { data: existingBookings, error: checkError } = await supabase
        .from('bookings')
        .select('start_time, end_time')
        .eq('nanny_id', nanny.id)
        .eq('date', bookingDate)
        .in('status', ['pending', 'confirmed']); // only block active bookings

      if (checkError) {
        console.error('Error checking existing bookings:', checkError);
      }

      const overlap = existingBookings?.some((b) => {
        const existingStart = b.start_time;
        const existingEnd = b.end_time;
        return startTime < existingEnd && endTime > existingStart;
      });

      if (overlap) {
        toast.error('This nanny is already booked during that time.');
        setSubmitting(false);
        return;
      }

      // 🧩 4️⃣ Build booking object
      const bookingData = {
        parent_id: parentRecord.id,
        nanny_id: nanny.id,
        nanny_name: nanny.name,
        parent_name: parentRecord.name || formData.name,
        date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        special_instructions: formData.specialRequirements || null,
        status: 'pending',
        hourlyrate: nanny.hourlyrate,
        total_amount: totalCost,
        created_at: new Date().toISOString(),
      };

      // 🧩 5️⃣ Insert booking
      const { error } = await supabase.from('bookings').insert([bookingData]);

      if (error) {
        console.error('Error creating booking:', error);
        toast.error('Failed to submit booking');
      } else {
        toast.success('Booking submitted successfully!');
        navigate('/bookings');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">

          <h1
            className="text-2xl font-bold text-green-600 cursor-pointer hover:text-green-700 transition-colors"
            onClick={() => navigate('/')}>
            DecsNanny
          </h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Booking Details for {nanny.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date */}
              <div className="space-y-2">
                <Label>Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => setFormData(prev => ({ ...prev, date }))}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time */}
              <div className="space-y-2">
                <Label>Start Time *</Label>
                <Select value={formData.time} onValueChange={(value) => setFormData(prev => ({ ...prev, time: value }))}>
                  <SelectTrigger><SelectValue placeholder="Select start time" /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                        {i.toString().padStart(2, '0')}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label>Duration (hours) *</Label>
                <Select value={formData.duration} onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}>
                  <SelectTrigger><SelectValue placeholder="Select duration" /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(h => (
                      <SelectItem key={h} value={h.toString()}>{h} hour{h > 1 ? 's' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <Label>Full Name *</Label>
                <Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} />

                <Label>Email *</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} />

                <Label>Phone *</Label>
                <Input type="tel" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} />
              </div>

              {/* Special Requirements */}
              <div className="space-y-2">
                <Label>Special Requirements (Optional)</Label>
                <Textarea value={formData.specialRequirements} onChange={(e) => setFormData(prev => ({ ...prev, specialRequirements: e.target.value }))} rows={3} />
              </div>

              {/* Total Cost */}
              {totalCost > 0 && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Cost:</span>
                    <span className="text-2xl font-bold text-green-600">${totalCost}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {formData.duration} hours × ${nanny.hourlyrate}/hour
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" size="lg" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Booking Request'}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
