import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Shield, Clock, Heart, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import NannyCard from '../components/NannyCard';
import ParentCard from '../components/ParentCard';
import { useAuth } from '../contexts/AuthContext';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ name: string } | null>(null);
  const [featuredProfiles, setFeaturedProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleDashboardNavigation = () => {
    if (user?.userType === 'nanny') {
      navigate('/nanny-dashboard');
    } else {
      navigate('/bookings');
    }
  };

  // Fetch profile name
  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;

      const table =
        user.userType === 'parent' ? 'parents' : user.userType === 'nanny' ? 'nannies' : null;
      if (!table) return;

      const { data, error } = await supabase
        .from(table)
        .select('name')
        .eq('user_id', user.id)
        .single();

      if (!error && data) setProfile(data);
    }

    fetchProfile();
  }, [user]);

  // Fetch recently booked profiles
  useEffect(() => {
    async function fetchRecentlyBooked() {
      if (!user) {
        setFeaturedProfiles([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      if (user.userType === 'parent') {
        // Get parent record
        const { data: parentRecord } = await supabase
          .from('parents')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!parentRecord) {
          setFeaturedProfiles([]);
          setLoading(false);
          return;
        }

        // Fetch nannies this parent booked
        const { data, error } = await supabase
          .from('bookings')
          .select('nanny: nannies(*)')
          .eq('parent_id', parentRecord.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (!error && data) {
          const nannies = data.map((b: any) => b.nanny).filter(Boolean);
          setFeaturedProfiles(nannies);
        } else {
          setFeaturedProfiles([]);
        }
      } else if (user.userType === 'nanny') {
        // Get nanny record
        const { data: nannyRecord } = await supabase
          .from('nannies')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!nannyRecord) {
          setFeaturedProfiles([]);
          setLoading(false);
          return;
        }

        // Fetch parents who booked this nanny
        const { data, error } = await supabase
          .from('bookings')
          .select('parent: parents(*)')
          .eq('nanny_id', nannyRecord.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (!error && data) {
          const parents = data.map((b: any) => b.parent).filter(Boolean);
          setFeaturedProfiles(parents);
        } else {
          setFeaturedProfiles([]);
        }
      }

      setLoading(false);
    }

    fetchRecentlyBooked();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 px-2 sm:px-4">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1
            className="text-2xl font-bold text-green-600 cursor-pointer hover:text-green-700 transition-colors"
            onClick={() => navigate('/')}
          >
            DecsNanny
          </h1>
          <div className="flex gap-2">
            {!user && (
              <Button variant="outline" onClick={() => navigate('/login')}>
                Sign In
              </Button>
            )}
            {user && (
              <Button variant="ghost" onClick={() => navigate('/profile')}>
                <User className="w-4 h-4 mr-1" />
                {profile?.name || 'Profile'}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <h2 className="text-4xl font-bold mb-4">
          {user?.userType === 'parent'
            ? 'Find the Perfect Nanny for Your Family'
            : user?.userType === 'nanny'
            ? 'Connect with Parents Looking for Great Nannies'
            : 'Welcome to DecsNanny'}
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          {user?.userType === 'parent'
            ? 'Connect with experienced, vetted nannies in your area.'
            : user?.userType === 'nanny'
            ? 'View parents who booked your services recently.'
            : 'Please sign in to see available nannies and parents.'}
        </p>

        {/* Buttons */}
        {user ? (
          <div className="flex justify-center gap-4">
            {user.userType === 'parent' && (
              <Button
                size="lg"
                onClick={() => navigate('/nannies')}
                className="bg-green-600 hover:bg-green-700 transition-colors"
              >
                Browse Nannies
              </Button>
            )}
            <Button
              size="lg"
              onClick={handleDashboardNavigation}
              className="bg-green-600 hover:bg-green-700 transition-colors"
            >
              {user.userType === 'nanny' ? 'My Dashboard' : 'My Bookings'}
            </Button>
          </div>
        ) : (
          <Button
            size="lg"
            onClick={() => navigate('/login')}
            className="bg-green-600 hover:bg-green-700 transition-colors"
          >
            Get Started
          </Button>
        )}
      </section>

      {/* Featured Profiles */}
      {user && (
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12">
              {user.userType === 'parent'
                ? 'Nannies Recently Booked'
                : 'Parents Recently Booked'}
            </h3>

            {loading ? (
              <p className="text-center text-gray-500">Loading profiles...</p>
            ) : featuredProfiles.length === 0 ? (
              <p className="text-center text-gray-500">No profiles found.</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {user.userType === 'parent'
                  ? featuredProfiles.map((profile) => (
                      <NannyCard key={profile.id} nanny={profile} />
                    ))
                  : featuredProfiles.map((profile) => (
                      <ParentCard key={profile.id} parent={profile} />
                    ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <Card>
            <CardContent>
              <Shield className="mx-auto mb-2 w-12 h-12 text-green-600" />
              <h4>Vetted Professionals</h4>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Star className="mx-auto mb-2 w-12 h-12 text-yellow-500" />
              <h4>Highly Rated</h4>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Clock className="mx-auto mb-2 w-12 h-12 text-emerald-600" />
              <h4>Flexible Scheduling</h4>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Heart className="mx-auto mb-2 w-12 h-12 text-red-500" />
              <h4>Peace of Mind</h4>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}