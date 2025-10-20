import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Camera, Edit, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.userType === 'nanny' ? 'Experienced childcare provider with a passion for nurturing young minds.' : '',
    location: user?.userType === 'nanny' ? 'Downtown' : '123 Main St, City',
    hourlyRate: user?.userType === 'nanny' ? '25' : '',
    experience: user?.userType === 'nanny' ? '5' : '',
    skills: user?.userType === 'nanny' ? ['CPR Certified', 'First Aid', 'Early Childhood Education'] : [],
    availability: user?.userType === 'nanny' ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] : [],
    children: user?.userType === 'parent' ? [{ name: 'Emma', age: 5 }, { name: 'Liam', age: 3 }] : []
  });

  const handleSave = async () => {
    setIsLoading(true);
    
    const success = await updateProfile({
      name: formData.name,
      email: formData.email,
      phone: formData.phone
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Please log in</h2>
            <Button onClick={() => navigate('/login')}>
              Go to Login
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
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-2xl font-bold text-blue-600">Dec'sNanny</h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => navigate('/bookings')}>
                My Bookings
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="relative">
                <img
                  src={user.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'}
                  alt={user.name}
                  className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0"
                />
                <Button
                  size="sm"
                  className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  <Badge variant={user.userType === 'nanny' ? 'default' : 'secondary'}>
                    {user.userType === 'nanny' ? 'Nanny' : 'Parent'}
                  </Badge>
                </div>
                
                <p className="text-gray-600 mb-4">{user.email}</p>
                <p className="text-gray-600 mb-6">{user.phone}</p>
                
                <div className="flex justify-center md:justify-start">
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant={isEditing ? "outline" : "default"}
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
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <Button onClick={handleSave} disabled={isLoading}>
                      <Save className="w-4 h-4 mr-2" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label>Full Name</Label>
                      <p className="text-lg">{user.name}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="text-lg">{user.email}</p>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <p className="text-lg">{user.phone}</p>
                    </div>
                    <div>
                      <Label>Member Since</Label>
                      <p className="text-lg">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {user.userType === 'nanny' && (
            <TabsContent value="professional">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Professional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Bio</Label>
                      <p className="text-gray-700">{formData.bio}</p>
                    </div>
                    <div>
                      <Label>Experience</Label>
                      <p className="text-lg">{formData.experience} years</p>
                    </div>
                    <div>
                      <Label>Hourly Rate</Label>
                      <p className="text-lg">${formData.hourlyRate}/hour</p>
                    </div>
                    <div>
                      <Label>Location</Label>
                      <p className="text-lg">{formData.location}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Skills & Certifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Availability</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                        <div
                          key={day}
                          className={`p-2 rounded text-center text-sm ${
                            formData.availability.includes(day)
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
              </div>
            </TabsContent>
          )}

          {user.userType === 'parent' && (
            <TabsContent value="family">
              <Card>
                <CardHeader>
                  <CardTitle>Family Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Address</Label>
                    <p className="text-lg">{formData.location}</p>
                  </div>
                  <div>
                    <Label>Children</Label>
                    <div className="space-y-2 mt-2">
                      {formData.children.map((child, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
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

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Notification Preferences
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Privacy Settings
                  </Button>
                  <Button variant="destructive" onClick={handleLogout} className="w-full">
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}