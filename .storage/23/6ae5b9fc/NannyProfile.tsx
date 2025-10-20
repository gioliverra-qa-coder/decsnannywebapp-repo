import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, Award, ArrowLeft } from 'lucide-react';
import { mockNannies } from '../data/mockData';

export default function NannyProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
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
            <h1 className="text-2xl font-bold text-blue-600">Dec'sNanny</h1>
            <Button variant="ghost" onClick={() => navigate('/bookings')}>
              My Bookings
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <img
                src={nanny.photo}
                alt={nanny.name}
                className="w-48 h-48 rounded-full object-cover mx-auto md:mx-0"
              />
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-4">{nanny.name}</h1>
                
                <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{nanny.rating}</span>
                    <span className="text-gray-600">({nanny.reviews.length} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {nanny.location}
                  </div>
                </div>

                <div className="flex items-center justify-center md:justify-start gap-4 mb-6">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Award className="w-4 h-4" />
                    {nanny.experience} years experience
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    ${nanny.hourlyRate}/hour
                  </div>
                </div>

                <Button 
                  size="lg" 
                  onClick={() => navigate(`/book/${nanny.id}`)}
                  className="w-full md:w-auto px-8"
                >
                  Book Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About {nanny.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{nanny.bio}</p>
            </CardContent>
          </Card>

          {/* Skills & Qualifications */}
          <Card>
            <CardHeader>
              <CardTitle>Skills & Qualifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {nanny.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <div
                    key={day}
                    className={`p-2 rounded text-center text-sm ${
                      nanny.availability.includes(day)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {nanny.reviews.map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-medium">{review.userName}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Bottom CTA */}
        <Card className="mt-8">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to book {nanny.name}?</h3>
            <p className="text-gray-600 mb-6">
              Schedule your childcare today and give your family the care they deserve.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate(`/book/${nanny.id}`)}
              className="px-8"
            >
              Book Now - ${nanny.hourlyRate}/hour
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}