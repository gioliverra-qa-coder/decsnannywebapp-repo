import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NannyCard from '../components/NannyCard';
import { supabase } from '../utils/supabaseClient';

export default function NannyList() {
  const navigate = useNavigate();
  const [nannies, setNannies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [rateFilter, setRateFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');

  // Fetch nannies from Supabase
  useEffect(() => {
    async function fetchNannies() {
      setLoading(true);
      const { data, error } = await supabase
        .from('nannies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching nannies:', error);
      } else {
        setNannies(data || []);
      }
      setLoading(false);
    }
    fetchNannies();
  }, []);

  // Filtering logic
  const filteredNannies = useMemo(() => {
    return nannies.filter((nanny) => {
      const matchesSearch =
        nanny.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nanny.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nanny.skills?.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesLocation = locationFilter === 'all' || nanny.location === locationFilter;

      const matchesRate =
        rateFilter === 'all' ||
        (rateFilter === 'under-25' && nanny.hourlyrate < 25) ||
        (rateFilter === '25-30' && nanny.hourlyrate >= 25 && nanny.hourlyrate <= 30) ||
        (rateFilter === 'over-30' && nanny.hourlyrate > 30);

      const matchesExperience =
        experienceFilter === 'all' ||
        (experienceFilter === 'under-5' && nanny.experience < 5) ||
        (experienceFilter === '5-10' && nanny.experience >= 5 && nanny.experience <= 10) ||
        (experienceFilter === 'over-10' && nanny.experience > 10);

      return matchesSearch && matchesLocation && matchesRate && matchesExperience;
    });
  }, [nannies, searchTerm, locationFilter, rateFilter, experienceFilter]);

  const locations = [...new Set(nannies.map(n => n.location))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">

          <h1
            className="text-2xl font-bold text-green-600 cursor-pointer hover:text-green-700 transition-colors"
            onClick={() => navigate('/')}>
            DecsNanny
          </h1>
          <Button variant="ghost" onClick={() => navigate('/bookings')}>My Bookings</Button>
          
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Nanny</h2>
        <p className="text-gray-600 mb-6">Browse through our verified childcare professionals</p>

        {/* Search & Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" /> Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search nannies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((loc) => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={rateFilter} onValueChange={setRateFilter}>
                <SelectTrigger><SelectValue placeholder="Hourly Rate" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rates</SelectItem>
                  <SelectItem value="under-25">Under $25/hr</SelectItem>
                  <SelectItem value="25-30">$25-$30/hr</SelectItem>
                  <SelectItem value="over-30">Over $30/hr</SelectItem>
                </SelectContent>
              </Select>

              <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                <SelectTrigger><SelectValue placeholder="Experience" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Experience</SelectItem>
                  <SelectItem value="under-5">Under 5 years</SelectItem>
                  <SelectItem value="5-10">5-10 years</SelectItem>
                  <SelectItem value="over-10">Over 10 years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <p className="text-gray-500 text-center">Loading nannies...</p>
        ) : filteredNannies.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-500 text-lg">No nannies found matching your criteria.</p>
              <p className="text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNannies.map((nanny) => <NannyCard key={nanny.id} nanny={nanny} />)}
          </div>
        )}
      </div>
    </div>
  );
}
