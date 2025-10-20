import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin } from 'lucide-react';
import { Nanny } from '../types';
import { useNavigate } from 'react-router-dom';

interface NannyCardProps {
  nanny: Nanny;
}

export default function NannyCard({ nanny }: NannyCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <img
            src={nanny.photo}
            alt={nanny.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{nanny.name}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
              <MapPin className="w-4 h-4" />
              {nanny.location}
            </div>
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{nanny.rating}</span>
              <span className="text-sm text-muted-foreground">
                ({nanny.reviews.length} reviews)
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {nanny.bio}
            </p>
            <div className="flex flex-wrap gap-1 mb-3">
              {nanny.skills.slice(0, 2).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {nanny.skills.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{nanny.skills.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div>
          <span className="text-2xl font-bold">${nanny.hourlyRate}</span>
          <span className="text-sm text-muted-foreground">/hour</span>
        </div>
        <Button onClick={() => navigate(`/nanny/${nanny.id}`)}>
          View Profile
        </Button>
      </CardFooter>
    </Card>
  );
}