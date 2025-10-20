import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Shield, Clock, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockNannies } from '../data/mockData';
import NannyCard from '../components/NannyCard';

export default function Index() {
  const navigate = useNavigate();
  const featuredNannies = mockNannies.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">NannyBook</h1>
            <div className="space-x-4">
              <Button variant="ghost" onClick={() => navigate('/nannies')}>
                Find Nannies
              </Button>
              <Button variant="ghost" onClick={() => navigate('/bookings')}>
                My Bookings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Find the Perfect Nanny for Your Family
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with experienced, vetted nannies in your area. Book trusted childcare 
            with just a few clicks and give your family the care they deserve.
          </p>
          <div className="space-x-4">
            <Button size="lg" onClick={() => navigate('/nannies')} className="px-8 py-3">
              Browse Nannies
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-3">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose NannyBook?
          </h3>
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h4 className="font-semibold text-lg mb-2">Vetted Professionals</h4>
                <p className="text-gray-600 text-sm">All nannies are background checked and verified</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h4 className="font-semibold text-lg mb-2">Highly Rated</h4>
                <p className="text-gray-600 text-sm">Read reviews from other families</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Clock className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h4 className="font-semibold text-lg mb-2">Flexible Scheduling</h4>
                <p className="text-gray-600 text-sm">Book for hours, days, or ongoing care</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h4 className="font-semibold text-lg mb-2">Peace of Mind</h4>
                <p className="text-gray-600 text-sm">Trusted care for your most precious ones</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Nannies */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Featured Nannies
          </h3>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {featuredNannies.map((nanny) => (
              <NannyCard key={nanny.id} nanny={nanny} />
            ))}
          </div>
          <div className="text-center">
            <Button onClick={() => navigate('/nannies')} size="lg">
              View All Nannies
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h4 className="text-2xl font-bold mb-4">NannyBook</h4>
          <p className="text-gray-400">
            Connecting families with trusted childcare providers since 2024
          </p>
        </div>
      </footer>
    </div>
  );
}