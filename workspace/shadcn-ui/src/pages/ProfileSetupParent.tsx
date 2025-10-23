import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProfileSetupParent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const [parentData, setParentData] = useState({
    address: '',
    children: [{ name: '', age: '' }],
    emergencyContact: { name: '', phone: '', relationship: '' }
  });

  const addChild = () => {
    setParentData(prev => ({
      ...prev,
      children: [...prev.children, { name: '', age: '' }]
    }));
  };

  const removeChild = (index: number) => {
    setParentData(prev => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== index)
    }));
  };

  const handleChildChange = (index: number, field: 'name' | 'age', value: string) => {
    setParentData(prev => ({
      ...prev,
      children: prev.children.map((child, i) => (i === index ? { ...child, [field]: value } : child))
    }));
  };

  const uploadProfileImage = async (file: File, userId: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;

      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, { upsert: true });

      if (error) throw error;

      const { data: publicData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      return publicData.publicUrl;
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Failed to upload image');
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      let imageUrl: string | null = null;
      if (profileImage) imageUrl = await uploadProfileImage(profileImage, user.id);

      const { error } = await supabase.from('parents').insert({
        user_id: user.id,
        address: parentData.address,
        children: parentData.children,
        emergency_contact: parentData.emergencyContact,
        profile_image: imageUrl,
        email: user.email || null,
        name: user.name || null,
        phone: user.phone || null
      });

      if (error) {
        console.error('Error inserting parent:', error);
        toast.error('Error saving parent profile.');
      } else {
        toast.success('Parent profile saved successfully!');
        navigate('/profile');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Complete Your Profile (Parent)</CardTitle>
            <p className="text-gray-600">Tell us about your family and childcare needs</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Label>Home Address</Label>
              <Input
                value={parentData.address}
                onChange={e => setParentData(prev => ({ ...prev, address: e.target.value }))}
              />

              <Label>Children</Label>
              <div className="space-y-2">
                {parentData.children.map((child, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <Input
                      placeholder="Name"
                      value={child.name}
                      onChange={e => handleChildChange(index, 'name', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Age"
                      value={child.age}
                      onChange={e => handleChildChange(index, 'age', e.target.value)}
                    />
                    {parentData.children.length > 1 && (
                      <Button onClick={() => removeChild(index)} size="sm" variant="outline">
                        <X />
                      </Button>
                    )}
                  </div>
                ))}
                <Button onClick={addChild} size="sm" variant="outline">
                  <Plus /> Add Child
                </Button>
              </div>

              <Label>Profile Photo</Label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setProfileImage(e.target.files?.[0] || null)}
              />
              {profileImage && (
                <img
                  src={URL.createObjectURL(profileImage)}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover mt-2"
                />
              )}

              <Label>Emergency Contact</Label>
              <Input
                placeholder="Name"
                value={parentData.emergencyContact.name}
                onChange={e => setParentData(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, name: e.target.value } }))}
              />
              <Input
                placeholder="Phone"
                value={parentData.emergencyContact.phone}
                onChange={e => setParentData(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, phone: e.target.value } }))}
              />
              <Input
                placeholder="Relationship"
                value={parentData.emergencyContact.relationship}
                onChange={e => setParentData(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, relationship: e.target.value } }))}
              />

              <Button onClick={handleSubmit} disabled={isLoading || !user} className="w-full bg-green-600 hover:bg-green-700">
                {isLoading ? 'Completing...' : 'Complete Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
