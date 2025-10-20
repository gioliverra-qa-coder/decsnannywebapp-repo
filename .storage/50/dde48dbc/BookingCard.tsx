import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, DollarSign, User, Phone, Mail } from 'lucide-react';
import { Booking } from '../types';
import { toast } from 'sonner';

interface BookingCardProps {
  booking: Booking;
  userType?: 'parent' | 'nanny';
}

export default function BookingCard({ booking, userType = 'parent' }: BookingCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAcceptBooking = () => {
    // Update booking status to confirmed
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const updatedBookings = bookings.map((b: Booking) => 
      b.id === booking.id ? { ...b, status: 'confirmed' } : b
    );
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
    toast.success('Booking request accepted!');
    window.location.reload(); // Refresh to show updated status
  };

  const handleDeclineBooking = () => {
    // Update booking status to cancelled
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const updatedBookings = bookings.map((b: Booking) => 
      b.id === booking.id ? { ...b, status: 'cancelled' } : b
    );
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
    toast.success('Booking request declined.');
    window.location.reload(); // Refresh to show updated status
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {userType === 'nanny' ? booking.userContact.name : booking.nannyName}
              </h3>
              <p className="text-gray-600 text-sm">
                {userType === 'nanny' ? 'Booking Request' : 'Nanny Service'}
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(booking.status)}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{new Date(booking.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{booking.time} ({booking.duration} hours)</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <DollarSign className="w-4 h-4" />
            <span>${booking.totalCost}</span>
          </div>
          {userType === 'nanny' && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{booking.userContact.phone}</span>
            </div>
          )}
        </div>

        {userType === 'nanny' && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Contact Information:</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3" />
                <span>{booking.userContact.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3" />
                <span>{booking.userContact.phone}</span>
              </div>
            </div>
          </div>
        )}

        {booking.specialRequirements && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-sm text-blue-700 mb-1">Special Requirements:</h4>
            <p className="text-sm text-blue-600">{booking.specialRequirements}</p>
          </div>
        )}

        {/* Action buttons for nannies */}
        {userType === 'nanny' && booking.status === 'pending' && (
          <div className="flex gap-2 mt-4">
            <Button 
              onClick={handleAcceptBooking}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Accept Request
            </Button>
            <Button 
              onClick={handleDeclineBooking}
              variant="outline" 
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
            >
              Decline
            </Button>
          </div>
        )}

        {/* Status message for confirmed bookings */}
        {booking.status === 'confirmed' && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700 font-medium">
              {userType === 'nanny' 
                ? '✓ You have accepted this booking request'
                : '✓ Your booking has been confirmed'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}