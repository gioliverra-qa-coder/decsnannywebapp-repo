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

interface ParentCardProps {
  parent: Parent;
}

export default function ParentCard({ parent }: ParentCardProps) {
  const navigate = useNavigate();

  // ✅ Construct full public image URL from Supabase Storage
  let profileImageUrl: string;
  if (parent.profile_image) {
    if (parent.profile_image.startsWith('http')) {
      profileImageUrl = parent.profile_image;
    } else {
      profileImageUrl = `${supabaseUrl}/storage/v1/object/public/${parent.profile_image.replace(/^public\//, '')}`;
    }
  } else {
    profileImageUrl = 'https://placehold.co/100x100?text=No+Photo';
  }

  const handleBookNow = () => navigate(`/book/${parent.id}`);
  const handleViewProfile = () => navigate(`/nanny/${parent.id}`);

  return (
    <Card className="w-full max-w-sm mx-auto hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex flex-col items-center space-y-3">
          {/* ✅ Use Supabase storage image */}
          <img
            src={profileImageUrl}
            alt={parent.name}
            className="w-20 h-20 rounded-full object-cover border border-gray-200"
          />
          <div className="text-center">
            <CardTitle className="text-lg">{parent.name}</CardTitle>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{parent.rating || '5.0'}</span>
              <span className="text-sm text-gray-500">
                ({parent.reviewCount || 0})
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span>{parent.address}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
