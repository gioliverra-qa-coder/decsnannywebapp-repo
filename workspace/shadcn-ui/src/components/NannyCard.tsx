import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Nanny } from '../types/user';
import { createClient } from '@supabase/supabase-js';

// ✅ Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface NannyCardProps {
  nanny: Nanny;
}

export default function NannyCard({ nanny }: NannyCardProps) {
  const navigate = useNavigate();

  // ✅ Construct full public image URL from Supabase Storage
  let profileImageUrl: string;
  if (nanny.profile_image) {
    if (nanny.profile_image.startsWith('http')) {
      profileImageUrl = nanny.profile_image;
    } else {
      profileImageUrl = `${supabaseUrl}/storage/v1/object/public/${nanny.profile_image.replace(/^public\//, '')}`;
    }
  } else {
    profileImageUrl = 'https://placehold.co/100x100?text=No+Photo';
  }

  const handleBookNow = () => navigate(`/book/${nanny.id}`);
  const handleViewProfile = () => navigate(`/nanny/${nanny.id}`);

  return (
    <Card className="w-full max-w-sm mx-auto hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex flex-col items-center space-y-3">
          {/* ✅ Use Supabase storage image */}
          <img
            src={profileImageUrl}
            alt={nanny.name}
            className="w-20 h-20 rounded-full object-cover border border-gray-200"
          />
          <div className="text-center">
            <CardTitle className="text-lg">{nanny.name}</CardTitle>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{nanny.rating || '5.0'}</span>
              <span className="text-sm text-gray-500">
                ({nanny.reviewCount || 0})
              </span>
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
            <span className="font-semibold text-green-600">
              {nanny.hourlyrate}/hr
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2">{nanny.bio}</p>

        <div>
          <h4 className="text-sm font-medium">Skills:</h4>
          <div className="flex flex-wrap gap-1 mt-1">
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

        <div>
          <h4 className="text-sm font-medium">Available:</h4>
          <div className="flex flex-wrap gap-1 mt-1">
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
          <Button size="sm" onClick={handleBookNow} className="flex-1 bg-green-600 hover:bg-green-700">
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
