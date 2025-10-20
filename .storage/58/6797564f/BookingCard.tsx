import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, DollarSign, User, Phone, Mail, CheckCircle, XCircle } from 'lucide-react';
import { Booking } from '../types';
import { toast } from 'sonner';

interface BookingCardProps {
  booking: Booking;
  userType?: 'parent' | 'nanny';
  onStatusUpdate?: () => void;
}

export default function BookingCard({ booking, userType = 'parent', onStatusUpdate }: BookingCardProps) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusMessage = (status: string, userType: 'parent' | 'nanny') => {
    if (userType === 'parent') {
      switch (status) {
        case 'pending':
          return 'Waiting for nanny confirmation';
        case 'confirmed':
          return 'Confirmed by nanny';
        case 'cancelled':
          return 'Booking was declined';
        case 'completed':
          return 'Service completed';
        default:
          return '';
      }
    } else {
      switch (status) {
        case 'pending':
          return 'Awaiting your response';
        case 'confirmed':
          return 'You accepted this booking';
        case 'cancelled':
          return 'You declined this booking';
        case 'completed':
          return 'Service completed';
        default:
          return '';
      }
    }
  };

  const updateBookingStatus = (newStatus: 'confirmed' | 'cancelled') => {
    // Update booking status in localStorage with timestamp for synchronization
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const updatedBookings = bookings.map((b: Booking) => 
      b.id === booking.id 
        ? { 
            ...b, 
            status: newStatus,
            lastUpdated: new Date().toISOString(),
            updatedBy: userType
          } 
        : b
    );
    
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
    
    // Trigger custom event for cross-tab/cross-user synchronization
    window.dispatchEvent(new CustomEvent('bookingStatusUpdated', {
      detail: { bookingId: booking.id, newStatus, updatedBy: userType }
    }));
    
    // Call parent callback to refresh the view
    if (onStatusUpdate) {
      onStatusUpdate();
    }
  };

  const handleAcceptBooking = () => {
    updateBookingStatus('confirmed');
    toast.success('Booking request accepted!');
  };

  const handleDeclineBooking = () => {
    updateBookingStatus('cancelled');
    toast.success('Booking request declined.');
  };

  return (
    <Card className={booking.status === 'confirmed' ? 'border-green-200 bg-green-50/30' : ''}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              booking.status === 'confirmed' ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <User className={`w-6 h-6 ${booking.status === 'confirmed' ? 'text-green-600' : 'text-gray-600'}`} />
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
          <div className="flex items-center gap-2">
            {getStatusIcon(booking.status)}
            <Badge className={getStatusColor(booking.status)}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Status Message */}
        <div className="mb-4">
          <p className={`text-sm font-medium ${
            booking.status === 'confirmed' ? 'text-green-700' : 
            booking.status === 'cancelled' ? 'text-red-700' : 
            'text-yellow-700'
          }`}>
            {getStatusMessage(booking.status, userType)}
          </p>
          {booking.lastUpdated && (
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {new Date(booking.lastUpdated).toLocaleString()}
            </p>
          )}
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

        {userType === 'nanny' && booking.status === 'confirmed' && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg">
            <h4 className="font-medium text-sm text-green-700 mb-2">Contact Information:</h4>
            <div className="space-y-1 text-sm text-green-600">
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

        {/* Confirmation message for parents */}
        {userType === 'parent' && booking.status === 'confirmed' && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-700 font-medium">
                Great! {booking.nannyName} has confirmed your booking request.
              </p>
            </div>
          </div>
        )}

        {/* Cancellation message for parents */}
        {userType === 'parent' && booking.status === 'cancelled' && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-700 font-medium">
                {booking.nannyName} was unable to accept this booking request.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}