import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockNannies } from '../data/mockData';
import NannyCard from '../components/NannyCard';

export default function NannyList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [rateFilter, setRateFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');

  const filteredNannies = useMemo(() => {
    return mockNannies.filter((nanny) => {
      const matchesSearch = nanny.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           nanny.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           nanny.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesLocation = locationFilter === 'all' || nanny.location === locationFilter;
      
      const matchesRate = rateFilter === 'all' || 
                         (rateFilter === 'under-25' && nanny.hourlyRate < 25) ||
                         (rateFilter === '25-30' && nanny.hourlyRate >= 25 && nanny.hourlyRate <= 30) ||
                         (rateFilter === 'over-30' && nanny.hourlyRate > 30);
      
      const matchesExperience = experienceFilter === 'all' ||
                               (experienceFilter === 'under-5' && nanny.experience < 5) ||
                               (experienceFilter === '5-10' && nanny.experience >= 5 && nanny.experience <= 10) ||
                               (experienceFilter === 'over-10' && nanny.experience > 10);

      return matchesSearch && matchesLocation && matchesRate && matchesExperience;
    });
  }, [searchTerm, locationFilter, rateFilter, experienceFilter]);

  const locations = [...new Set(mockNannies.map(nanny => nanny.location))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => navigate('/')}>
              ← Back to Home
            </Button>
            <h1 className="text-2xl font-bold text-blue-600">Dec'sNanny</h1>
            <Button variant="ghost" onClick={() => navigate('/bookings')}>
              My Bookings
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Nanny</h2>
          <p className="text-gray-600">Browse through our verified childcare professionals</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Search & Filter
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
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={rateFilter} onValueChange={setRateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Hourly Rate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rates</SelectItem>
                  <SelectItem value="under-25">Under $25/hr</SelectItem>
                  <SelectItem value="25-30">$25-$30/hr</SelectItem>
                  <SelectItem value="over-30">Over $30/hr</SelectItem>
                </SelectContent>
              </Select>

              <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
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

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {filteredNannies.length} of {mockNannies.length} nannies
          </p>
        </div>

        {filteredNannies.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-500 text-lg">No nannies found matching your criteria.</p>
              <p className="text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNannies.map((nanny) => (
              <NannyCard key={nanny.id} nanny={nanny} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}