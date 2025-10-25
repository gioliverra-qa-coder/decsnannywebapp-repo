// src/components/BookingCard.tsx
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
  onMarkPaid,
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
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const canMarkCompleted = isNanny && booking.status === 'accepted';
  const canMarkPaid = isNanny && booking.status === 'completed';

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between gap-2 sm:items-start">
          <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">
            {isNanny
              ? `Booking with ${booking.parentName || 'Parent'}`
              : `Booking with ${booking.nannyName || 'Nanny'}`}
          </CardTitle>
          <Badge className={`${getStatusColor(booking.status)} flex items-center gap-1 self-start`}>
            {getStatusIcon(booking.status)}
            <span className="capitalize text-xs sm:text-sm">{booking.status}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 text-sm sm:text-base">
        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="flex items-center space-x-2 text-gray-700">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>{formatDate(booking.date)}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-700">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>
              {booking.start_time} - {booking.end_time}
            </span>
          </div>
        </div>

        {/* Children Info */}
        {booking.children && booking.children.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-gray-700 font-medium">
              <User className="w-4 h-4 text-gray-500" />
              <span>Children</span>
            </div>
            <div className="ml-6 space-y-1 text-gray-600 text-sm">
              {booking.children.map((child: any, index: number) => (
                <div key={index}>
                  {typeof child === 'string'
                    ? child
                    : `${child.name} (${child.age} yrs)${
                        child.specialNeeds ? ` • ${child.specialNeeds}` : ''
                      }`}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Special Instructions */}
        {booking.special_instructions && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Special Instructions:</p>
            <div className="bg-gray-50 p-2 sm:p-3 rounded text-gray-600 text-sm">
              {booking.special_instructions}
            </div>
          </div>
        )}

        {/* Price & Duration */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2 border-t border-gray-100">
          <div className="font-semibold text-gray-900 text-base sm:text-lg">
            ${booking.total_amount}
          </div>
          <div className="text-gray-500 text-sm sm:text-base">
            ${booking.hourlyrate}/hr • {booking.duration} hr(s)
          </div>
        </div>

        {/* Action Buttons */}
        {booking.status === 'pending' && isNanny && onAccept && onDecline && (
          <div className="flex flex-col sm:flex-row gap-2 pt-3">
            <Button
              onClick={() => onAccept(booking.id)}
              className="w-full sm:w-auto flex-1 bg-green-600 hover:bg-green-700"
            >
              Accept
            </Button>
            <Button
              onClick={() => onDecline(booking.id)}
              variant="outline"
              className="w-full sm:w-auto flex-1 border-red-300 text-red-600 hover:bg-red-50"
            >
              Decline
            </Button>
          </div>
        )}

        {canMarkCompleted && onMarkCompleted && (
          <Button
            onClick={() => onMarkCompleted(booking.id)}
            className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Star className="w-4 h-4" />
            Mark as Completed
          </Button>
        )}

        {canMarkPaid && onMarkPaid && (
          <Button
            onClick={() => onMarkPaid(booking.id)}
            className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" />
            Mark as Paid
          </Button>
        )}
      </CardContent>
    </Card>
  );
}