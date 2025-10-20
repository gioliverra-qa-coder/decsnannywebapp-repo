import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Nanny } from '../types/user';

interface NannyCardProps {
  nanny: Nanny;
}

export default function NannyCard({ nanny }: NannyCardProps) {
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate(`/book/${nanny.id}`);
  };

  const handleViewProfile = () => {
    navigate(`/nanny/${nanny.id}`);
  };

  return (
    <Card className="w-full max-w-sm mx-auto hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex flex-col items-center space-y-3">
          <img
            src={nanny.profileImage || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face'}
            alt={nanny.name}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div className="text-center">
            <CardTitle className="text-lg">{nanny.name}</CardTitle>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{nanny.rating}</span>
              <span className="text-sm text-gray-500">({nanny.reviewCount || 0})</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span>{nanny.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>{nanny.experience}y exp</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="font-semibold text-green-600">${nanny.hourlyRate}/hr</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-600 line-clamp-2">
            {nanny.bio}
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Skills:</h4>
          <div className="flex flex-wrap gap-1">
            {(nanny.skills || []).slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {(nanny.skills || []).length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{(nanny.skills || []).length - 3} more
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Available:</h4>
          <div className="flex flex-wrap gap-1">
            {(nanny.availability || []).slice(0, 3).map((day, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {day.slice(0, 3)}
              </Badge>
            ))}
            {(nanny.availability || []).length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{(nanny.availability || []).length - 3} more
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleViewProfile}
            className="flex-1"
          >
            View Profile
          </Button>
          <Button 
            size="sm" 
            onClick={handleBookNow}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}