import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, CheckCircle, XCircle, Package, Star } from 'lucide-react';
import { Booking } from '../types/user';
import { useAuth } from '../contexts/AuthContext';

interface BookingCardProps {
  booking: Booking;
  onAccept?: (bookingId: string) => void;
  onDecline?: (bookingId: string) => void;
  onMarkCompleted?: (bookingId: string) => void;
  onMarkPaid?: (bookingId: string) => void;
}

export default function BookingCard({
  booking,
  onAccept,
  onDecline,
  onMarkCompleted,
  onMarkPaid
}: BookingCardProps) {
  const { user } = useAuth();
  const isNanny = user?.userType === 'nanny';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'declined':
        return <XCircle className="w-4 h-4" />;
      case 'completed':
        return <Star className="w-4 h-4" />;
      case 'paid':
        return <Package className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  const canMarkCompleted = isNanny && booking.status === 'accepted';
  const canMarkPaid = isNanny && booking.status === 'completed';
  const showCompletedButton = canMarkCompleted && onMarkCompleted;
  const showPaidButton = canMarkPaid && onMarkPaid;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            {isNanny
              ? `Booking with ${booking.parent?.name || booking.parentName || 'Unknown Parent'}`
              : `Booking with ${booking.nannyName || 'Unknown Nanny'}`}
          </CardTitle>
          <Badge className={`${getStatusColor(booking.status)} flex items-center gap-1`}>
            {getStatusIcon(booking.status)}
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Booking Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{formatDate(booking.date)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm">
              {booking.startTime || booking.start_time} - {booking.endTime || booking.end_time}
            </span>
          </div>
        </div>

        {/* Children Section */}
        {booking.children && booking.children.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Children:</span>
            </div>
            <div className="ml-6 space-y-1">
              {booking.children.map((child: any, index: number) => (
                <div key={index} className="text-sm text-gray-600">
                  {typeof child === 'string'
                    ? child
                    : `${child.name || 'Unnamed'} (${child.age || '?'} years old)`}

                  {child.specialNeeds && (
                    <span className="text-orange-600 ml-2">• {child.specialNeeds}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Special Instructions */}
        {booking.specialInstructions && (
          <div className="space-y-2">
            <span className="text-sm font-medium">Special Instructions:</span>
            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              {booking.specialInstructions}
            </p>
          </div>
        )}

        {/* Pricing */}
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="font-semibold text-lg">${booking.total_amount}</span>
          <span className="text-sm text-gray-500">${booking.hourlyrate}/hour</span>
        </div>

        {/* Buttons */}
        {booking.status === 'pending' && isNanny && onAccept && onDecline && (
          <div className="flex space-x-2 pt-2">
            <Button
              onClick={() => onAccept(booking.id)}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Accept
            </Button>
            <Button
              onClick={() => onDecline(booking.id)}
              variant="outline"
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
            >
              Decline
            </Button>
          </div>
        )}

        {showCompletedButton && (
          <div className="pt-2">
            <Button
              onClick={() => onMarkCompleted(booking.id)}
              className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Star className="w-4 h-4" />
              Mark as Completed
            </Button>
          </div>
        )}

        {showPaidButton && (
          <div className="pt-2">
            <Button
              onClick={() => onMarkPaid(booking.id)}
              className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" />
              Mark as Paid
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
