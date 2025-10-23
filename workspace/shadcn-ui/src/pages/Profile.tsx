import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Camera, Edit, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '../utils/supabaseClient';

export default function Profile() {
  const navigate = useNavigate();
  const { user, setUser, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  // Fetch latest profile from Supabase
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const table = user.userType === 'nanny' ? 'nannies' : 'parents';
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfileData(data);
        // Update context so profile image updates across app
        setUser && setUser({ ...user, ...data });
      }
    };
    fetchProfile();
  }, [user, setUser]);

  const handleSave = async () => {
    if (!profileData) return;
    setIsLoading(true);

    const success = await updateProfile({
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone
    });

    if (success) {
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } else {
      toast.error('Failed to update profile. Please try again.');
    }

    setIsLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  if (!user || !profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Loading profile...</h2>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold text-green-600">DecsNanny</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/bookings')}>
              My Bookings
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8 flex flex-col md:flex-row gap-8">
            <div className="relative">
              <img
                src={profileData.profile_image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'}
                alt={profileData.name}
                className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0"
              />
              <Button
                size="sm"
                className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0 bg-green-600 hover:bg-green-700"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                <h1 className="text-3xl font-bold">{profileData.name}</h1>
                <Badge
                  variant={user.userType === 'nanny' ? 'default' : 'secondary'}
                  className={user.userType === 'nanny' ? 'bg-green-600' : ''}
                >
                  {user.userType === 'nanny' ? 'Nanny' : 'Parent'}
                </Badge>
              </div>

              <p className="text-gray-600 mb-4">{profileData.email}</p>
              <p className="text-gray-600 mb-6">{profileData.phone}</p>

              <div className="flex justify-center md:justify-start">
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? 'outline' : 'default'}
                  className={!isEditing ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  {isEditing ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            {user.userType === 'nanny' && <TabsTrigger value="professional">Professional</TabsTrigger>}
            {user.userType === 'parent' && <TabsTrigger value="family">Family</TabsTrigger>}
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Basic Info */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={e => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={e => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={e => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <Button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label>Full Name</Label>
                      <p className="text-lg">{profileData.name}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="text-lg">{profileData.email}</p>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <p className="text-lg">{profileData.phone}</p>
                    </div>
                    <div>
                      <Label>Member Since</Label>
                      <p className="text-lg">{new Date(profileData.created_at || user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nanny Professional Info */}
          {user.userType === 'nanny' && (
            <TabsContent value="professional">
              <Card>
                <CardHeader>
                  <CardTitle>Professional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Bio</Label>
                    <p className="text-gray-700">{profileData.bio}</p>
                  </div>
                  <div>
                    <Label>Experience</Label>
                    <p className="text-lg">{profileData.experience} years</p>
                  </div>
                  <div>
                    <Label>Hourly Rate</Label>
                    <p className="text-lg">${profileData.hourlyrate}/hour</p>
                  </div>
                  <div>
                    <Label>Location</Label>
                    <p className="text-lg">{profileData.location}</p>
                  </div>
                  <div>
                    <Label>Skills</Label>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills?.map((skill: string, idx: number) => (
                        <Badge key={idx} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Availability</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {profileData.availability?.map((day: string) => (
                        <div key={day} className="p-2 rounded text-center text-sm bg-green-100 text-green-800">
                          {day}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Parent Family Info */}
          {user.userType === 'parent' && (
            <TabsContent value="family">
              <Card>
                <CardHeader>
                  <CardTitle>Family Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Address</Label>
                    <p className="text-lg">{profileData.address}</p>
                  </div>
                  <div>
                    <Label>Children</Label>
                    <div className="space-y-2 mt-2">
                      {profileData.children?.map((child: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{child.name}</p>
                            <p className="text-sm text-gray-600">{child.age} years old</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Settings */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">Change Password</Button>
                <Button variant="outline" className="w-full justify-start">Notification Preferences</Button>
                <Button variant="outline" className="w-full justify-start">Privacy Settings</Button>
                <Button variant="destructive" onClick={handleLogout} className="w-full">Logout</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}