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
        setUser && setUser({ ...user, ...data });
      }
    };
    fetchProfile();
  }, [user, setUser]);

  const handleSave = async () => {
    if (!profileData) return;
    setIsLoading(true);

    const updatedFields: any = {
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone
    };

    if (user?.userType === 'nanny') {
      updatedFields.bio = profileData.bio;
      updatedFields.experience = profileData.experience;
      updatedFields.hourlyrate = profileData.hourlyrate;
      updatedFields.skills = profileData.skills;
      updatedFields.availability = profileData.availability;
      updatedFields.location = profileData.location;
    } else if (user?.userType === 'parent') {
      updatedFields.address = profileData.address;
      updatedFields.children = profileData.children;
    }

    const success = await updateProfile(updatedFields);

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

  // Profile image upload handler
  const handleProfileImageChange = async (file: File) => {
    if (!user) return;
    setIsLoading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      const success = await updateProfile({ profile_image: publicUrlData.publicUrl });
      if (success) {
        setProfileData(prev => ({ ...prev, profile_image: publicUrlData.publicUrl }));
        toast.success('Profile image updated!');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to upload image');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-600 cursor-pointer" onClick={() => navigate('/')}>DecsNanny
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/bookings')}>My Bookings</Button>
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-4 sm:p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
            <div className="relative">
              <img
                src={profileData.profile_image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'}
                alt={profileData.name}
                className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover border border-gray-200"
              />

              <input
                type="file"
                accept="image/*"
                id="profileImageInput"
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) handleProfileImageChange(e.target.files[0]);
                  e.target.value = '';
                }}
              />

              <Button
                size="sm"
                className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0 bg-green-600 hover:bg-green-700"
                onClick={() => document.getElementById('profileImageInput')?.click()}>
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
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? 'outline' : 'default'}
                  className={!isEditing ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  {isEditing ? (
                    <>
                      <X className="w-4 h-4 mr-2" /> Cancel
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" /> Edit Profile
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
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
              <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6 md:p-8">
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
                  <div className="space-y-4 p-4 sm:p-6 md:p-8">
                    <div><Label>Full Name</Label><p className="text-lg">{profileData.name}</p></div>
                    <div><Label>Email</Label><p className="text-lg">{profileData.email}</p></div>
                    <div><Label>Phone</Label><p className="text-lg">{profileData.phone}</p></div>
                    <div><Label>Member Since</Label><p className="text-lg">{new Date(profileData.created_at || user.createdAt).toLocaleDateString()}</p></div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nanny Professional Info */}
          {user.userType === 'nanny' && (
            <TabsContent value="professional">
              <Card>
                <CardHeader><CardTitle>Professional Information</CardTitle></CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6 md:p-8">
                  {isEditing ? (
                    <>
                      <div><Label>Bio</Label>
                        <Input
                          value={profileData.bio}
                          onChange={e => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        />
                      </div>
                      <div><Label>Experience (years)</Label>
                        <Input
                          type="number"
                          value={profileData.experience}
                          onChange={e => setProfileData(prev => ({ ...prev, experience: e.target.value }))}
                        />
                      </div>
                      <div><Label>Hourly Rate</Label>
                        <Input
                          type="number"
                          value={profileData.hourlyrate}
                          onChange={e => setProfileData(prev => ({ ...prev, hourlyrate: e.target.value }))}
                        />
                      </div>
                      <div><Label>Location</Label>
                        <Input
                          value={profileData.location}
                          onChange={e => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                        />
                      </div>

                      {/* --- Add Save Button Here --- */}
                      <Button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isLoading ? 'Saving...' : 'Save Professional Info'}
                      </Button>
                    </>
                  ) : (
                    <>
                      <p><strong>Bio:</strong> {profileData.bio}</p>
                      <p><strong>Experience:</strong> {profileData.experience} years</p>
                      <p><strong>Hourly Rate:</strong> ${profileData.hourlyrate}/hr</p>
                      <p><strong>Location:</strong> {profileData.location}</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {user.userType === 'parent' && (
            <TabsContent value="family">
              <Card>
                <CardHeader>
                  <CardTitle>Family Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-4 sm:p-6 md:p-8">
                  {isEditing ? (
                    <>
                      {/* Address */}
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          value={profileData.address || ''}
                          onChange={(e) =>
                            setProfileData((prev) => ({ ...prev, address: e.target.value }))
                          }
                        />
                      </div>

                      {/* Children Management */}
                      <div className="space-y-3">
                        <Label>Children</Label>
                        {profileData.children?.map((child: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg"
                          >
                            <Input
                              placeholder="Child name"
                              value={child.name}
                              onChange={(e) => {
                                const updated = [...profileData.children];
                                updated[idx].name = e.target.value;
                                setProfileData((prev) => ({ ...prev, children: updated }));
                              }}
                            />
                            <Input
                              placeholder="Age"
                              type="number"
                              className="w-24"
                              value={child.age}
                              onChange={(e) => {
                                const updated = [...profileData.children];
                                updated[idx].age = e.target.value;
                                setProfileData((prev) => ({ ...prev, children: updated }));
                              }}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const updated = profileData.children.filter(
                                  (_: any, i: number) => i !== idx
                                );
                                setProfileData((prev) => ({ ...prev, children: updated }));
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setProfileData((prev) => ({
                              ...prev,
                              children: [...(prev.children || []), { name: '', age: '' }],
                            }))
                          }
                        >
                          + Add Child
                        </Button>
                      </div>

                      {/* Save Changes */}
                      <Button
                        onClick={async () => {
                          setIsLoading(true);
                          const { error } = await supabase
                            .from('parents')
                            .update({
                              address: profileData.address,
                              children: profileData.children,
                            })
                            .eq('user_id', user.id);

                          setIsLoading(false);

                          if (error) {
                            toast.error('Failed to update family info');
                            console.error(error);
                          } else {
                            toast.success('Family info updated!');
                            setIsEditing(false);
                          }
                        }}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isLoading ? 'Saving...' : 'Save Family Info'}
                      </Button>
                    </>
                  ) : (
                    <>
                      {/* Display Only */}
                      <div>
                        <Label>Address</Label>
                        <p className="text-lg">{profileData.address || '—'}</p>
                      </div>
                      <div>
                        <Label>Children</Label>
                        {profileData.children?.length ? (
                          <div className="space-y-2 mt-2">
                            {profileData.children.map((child: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                              >
                                <div>
                                  <p className="font-medium">{child.name}</p>
                                  <p className="text-sm text-gray-600">
                                    {child.age} years old
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-600 mt-2">No children added yet.</p>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
          {/* Settings */}
          <TabsContent value="settings">
            <Card>
              <CardHeader><CardTitle>Account Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6 md:p-8">
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