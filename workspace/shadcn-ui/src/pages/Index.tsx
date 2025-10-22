import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Shield, Clock, Heart, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import NannyCard from '../components/NannyCard';
import { useAuth } from '../contexts/AuthContext';

// Initialize Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth(); // <-- get current user
  const [featuredNannies, setFeaturedNannies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeaturedNannies() {
      setLoading(true);
      const { data, error } = await supabase
        .from('nannies')
        .select('*')
        .limit(3)  // Top 3 nannies for featured section
        .order('created_at', { ascending: false }); // newest first
      if (error) {
        console.error('Error fetching featured nannies:', error);
      } else {
        const cleanedData = (data || []).map(n => ({
          ...n,
          experience: Number(n.experience),
          hourlyrate: Number(n.hourlyrate)
        }));
        setFeaturedNannies(cleanedData);
      }
      setLoading(false);
    }
    fetchFeaturedNannies();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 px-2 sm:px-4">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1
            className="text-2xl font-bold text-green-600 cursor-pointer"
            onClick={() => navigate('/')}
          >
            DecsNanny
          </h1>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/nannies')}
              disabled={!user} // disable if user not signed in
              title={!user ? 'Please sign in first' : 'Find Nannies'} // optional tooltip
            >
              Find Nannies
            </Button>

            {!user && (
              <Button variant="outline" onClick={() => navigate('/login')}>
                Sign In
              </Button>
            )}

            {user && (
              <Button variant="ghost" onClick={() => navigate('/profile')}>
                <User className="w-4 h-4 mr-1" />
                {user.name}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 text-center">
        <h2 className="text-4xl font-bold mb-4">Find the Perfect Nanny for Your Family</h2>
        <p className="text-lg text-gray-600 mb-8">
          Connect with experienced, vetted nannies in your area.
        </p>
        <Button 
          size="lg" 
          onClick={() => navigate('/nannies')} 
          className="bg-green-600 hover:bg-green-700"
          disabled={!user}
        >
          Browse Nannies
        </Button>
      </section>

      {/* Featured Nannies */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Featured Nannies</h3>

          {loading ? (
            <p className="text-center text-gray-500">Loading featured nannies...</p>
          ) : featuredNannies.length === 0 ? (
            <p className="text-center text-gray-500">No featured nannies found.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredNannies.map(nanny => <NannyCard key={nanny.id} nanny={nanny} />)}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <Card><CardContent><Shield className="mx-auto mb-2 w-12 h-12 text-green-600" /><h4>Vetted Professionals</h4></CardContent></Card>
          <Card><CardContent><Star className="mx-auto mb-2 w-12 h-12 text-yellow-500" /><h4>Highly Rated</h4></CardContent></Card>
          <Card><CardContent><Clock className="mx-auto mb-2 w-12 h-12 text-emerald-600" /><h4>Flexible Scheduling</h4></CardContent></Card>
          <Card><CardContent><Heart className="mx-auto mb-2 w-12 h-12 text-red-500" /><h4>Peace of Mind</h4></CardContent></Card>
        </div>
      </section>
    </div>
  );
}
