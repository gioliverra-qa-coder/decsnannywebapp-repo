import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User, CheckCircle, XCircle, Package } from 'lucide-react';
import { Booking } from '../types/user';
import { useAuth } from '../contexts/AuthContext';

interface BookingCardProps {
  booking: Booking;
  onAccept?: (bookingId: string) => void;
  onDecline?: (bookingId: string) => void;
  onMarkDelivered?: (bookingId: string) => void;
}

export default function BookingCard({ booking, onAccept, onDecline, onMarkDelivered }: BookingCardProps) {
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
      case 'delivered':
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
      case 'delivered':
        return <Package className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const canMarkDelivered = isNanny && booking.status === 'completed';
  const showDeliveredButton = canMarkDelivered && onMarkDelivered;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            {isNanny ? `Booking with ${booking.parentName}` : `Booking with ${booking.nannyName}`}
          </CardTitle>
          <Badge className={`${getStatusColor(booking.status)} flex items-center gap-1`}>
            {getStatusIcon(booking.status)}
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{formatDate(booking.date)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{booking.startTime} - {booking.endTime}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Children:</span>
          </div>
          <div className="ml-6 space-y-1">
            {booking.children.map((child, index) => (
              <div key={index} className="text-sm text-gray-600">
                {child.name} ({child.age} years old)
                {child.specialNeeds && (
                  <span className="text-orange-600 ml-2">• {child.specialNeeds}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {booking.specialInstructions && (
          <div className="space-y-2">
            <span className="text-sm font-medium">Special Instructions:</span>
            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              {booking.specialInstructions}
            </p>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t">
          <span className="font-semibold text-lg">${booking.totalAmount}</span>
          <span className="text-sm text-gray-500">${booking.hourlyRate}/hour</span>
        </div>

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

        {showDeliveredButton && (
          <div className="pt-2">
            <Button 
              onClick={() => onMarkDelivered(booking.id)} 
              className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" />
              Mark as Delivered
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}