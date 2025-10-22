import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, MapPin, Clock, Users, Heart, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function NannyProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [nanny, setNanny] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch nanny from Supabase
  useEffect(() => {
    async function fetchNanny() {
      setLoading(true);
      const { data, error } = await supabase
        .from('nannies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching nanny:', error);
        toast.error('Failed to fetch nanny info');
        navigate('/nannies');
      } else {
        setNanny(data);
      }
      setLoading(false);
    }

    fetchNanny();
  }, [id, navigate]);

  if (loading) {
    return <p className="text-center mt-10">Loading nanny profile...</p>;
  }

  if (!nanny) {
    return (
      <Card className="text-center py-12 mx-auto mt-10 max-w-md">
        <CardContent>
          <h2 className="text-2xl font-bold mb-4">Nanny Not Found</h2>
          <Button onClick={() => navigate('/nannies')}>Back to Nanny List</Button>
        </CardContent>
      </Card>
    );
  }

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.userType !== 'parent') return;

    navigate(`/book/${nanny.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate('/nannies')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Nannies
          </Button>
          <h1 className="text-2xl font-bold text-green-600">DecsNanny</h1>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" onClick={() => navigate('/bookings')}>
                  My Bookings
                </Button>
                <Button variant="ghost" onClick={() => navigate('/profile')}>
                  <User className="w-4 h-4 mr-2" />
                  {user?.name}
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate('/login')}>Login</Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Image and Basic Info */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-6 text-center">
                <img
                  src={nanny.photo}
                  alt={nanny.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{nanny.name}</h1>
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm text-gray-600">
                    {nanny.rating} ({nanny.reviews} reviews)
                  </span>
                </div>
                <div className="flex items-center justify-center mb-4">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="ml-1 text-sm text-gray-600">{nanny.location}</span>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-4">
                  ${nanny.hourlyrate}/hour
                </div>

                {user?.userType === 'parent' && (
                  <Button
                    onClick={handleBookNow}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Book Now
                  </Button>
                )}

                {user?.userType === 'nanny' && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      You're viewing this profile as a nanny. Only parents can book services.
                    </p>
                  </div>
                )}

                {!isAuthenticated && (
                  <Button
                    onClick={() => navigate('/login')}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    Login to Book
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Info */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About {nanny.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{nanny.bio}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Experience & Skills</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Experience</h4>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-700">{nanny.experience} years of experience</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Age Groups</h4>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-700">{nanny.ageGroups.join(', ')}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {nanny.skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
