import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, DollarSign, CheckCircle, XCircle, Truck } from 'lucide-react';
import { Booking } from '../types/user';

interface BookingCardProps {
  booking: Booking;
  onAccept?: (bookingId: string) => void;
  onDecline?: (bookingId: string) => void;
  onMarkDelivered?: (bookingId: string) => void;
  userType?: 'parent' | 'nanny';
}

export default function BookingCard({ 
  booking, 
  onAccept, 
  onDecline, 
  onMarkDelivered,
  userType 
}: BookingCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'declined': return <XCircle className="w-4 h-4" />;
      case 'delivered': return <Truck className="w-4 h-4" />;
      default: return null;
    }
  };

  const canMarkDelivered = userType === 'nanny' && booking.status === 'accepted';
  const isPastDate = new Date(booking.date) < new Date();

  // Safely handle children data - it could be an array or a number
  const getChildrenDisplay = () => {
    if (!booking.children) return 'No children specified';
    
    // If it's a number, just display the count
    if (typeof booking.children === 'number') {
      return `${booking.children} children`;
    }
    
    // If it's an array, display the names
    if (Array.isArray(booking.children)) {
      return booking.children.map(child => 
        typeof child === 'string' ? child : child.name
      ).join(', ');
    }
    
    return 'Children info not available';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            {userType === 'nanny' ? booking.parentName : booking.nannyName}
          </CardTitle>
          <Badge className={`${getStatusColor(booking.status)} flex items-center gap-1`}>
            {getStatusIcon(booking.status)}
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{new Date(booking.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm">
              {booking.startTime} - {booking.endTime || 'End time not set'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{getChildrenDisplay()}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <span className="text-sm">
              ${booking.totalAmount || booking.totalCost || 0}
            </span>
          </div>
        </div>
        
        {booking.specialInstructions && (
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              <strong>Special Instructions:</strong> {booking.specialInstructions}
            </p>
          </div>
        )}

        {booking.status === 'pending' && userType === 'nanny' && (
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={() => onAccept?.(booking.id)} 
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Accept
            </Button>
            <Button 
              onClick={() => onDecline?.(booking.id)} 
              variant="outline" 
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Decline
            </Button>
          </div>
        )}

        {canMarkDelivered && isPastDate && (
          <div className="pt-2">
            <Button 
              onClick={() => onMarkDelivered?.(booking.id)} 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Truck className="w-4 h-4 mr-2" />
              Mark as Delivered
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}