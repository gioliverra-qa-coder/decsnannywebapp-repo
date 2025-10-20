import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, MapPin, Clock, Users, Heart, User } from 'lucide-react';
import { mockNannies } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';

export default function NannyProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const nanny = mockNannies.find(n => n.id === id);

  if (!nanny) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Nanny Not Found</h2>
            <Button onClick={() => navigate('/nannies')}>
              Back to Nanny List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Only allow parents to create bookings
    if (user?.userType !== 'parent') {
      return; // Do nothing if user is not a parent
    }
    
    navigate(`/book/${nanny.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
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
                <Button onClick={() => navigate('/login')}>
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Image and Basic Info */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
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
                    ${nanny.hourlyRate}/hour
                  </div>
                  
                  {/* Only show Book Now button for parents */}
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
                  
                  {/* Show message for nannies */}
                  {user?.userType === 'nanny' && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        You're viewing this profile as a nanny. Only parents can book services.
                      </p>
                    </div>
                  )}
                  
                  {/* Show login prompt for non-authenticated users */}
                  {!isAuthenticated && (
                    <Button 
                      onClick={() => navigate('/login')}
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      Login to Book
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Information */}
          <div className="md:col-span-2 space-y-6">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About {nanny.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{nanny.bio}</p>
              </CardContent>
            </Card>

            {/* Experience & Skills */}
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
                    {nanny.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(nanny.availability).map(([day, hours]) => (
                    <div key={day} className="flex justify-between">
                      <span className="font-medium capitalize">{day}:</span>
                      <span className="text-gray-600">{hours}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Languages */}
            <Card>
              <CardHeader>
                <CardTitle>Languages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {nanny.languages.map((language, index) => (
                    <Badge key={index} variant="outline">
                      {language}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}