import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const availableDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const commonSkills = [
  'CPR Certified',
  'First Aid',
  'Early Childhood Education',
  'Meal Preparation',
  'Homework Help',
  'Swimming',
  'Arts & Crafts',
  'Music',
  'Bilingual'
];

export default function ProfileSetupNanny() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const [nannyData, setNannyData] = useState({
    bio: '',
    experience: '',
    hourlyrate: '',
    location: '',
    skills: [] as string[],
    availability: [] as string[],
    newSkill: ''
  });

  const handleAddSkill = () => {
    if (nannyData.newSkill && !nannyData.skills.includes(nannyData.newSkill)) {
      setNannyData(prev => ({
        ...prev,
        skills: [...prev.skills, prev.newSkill],
        newSkill: ''
      }));
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setNannyData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleAvailabilityChange = (day: string, checked: boolean) => {
    setNannyData(prev => ({
      ...prev,
      availability: checked ? [...prev.availability, day] : prev.availability.filter(d => d !== day)
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

      if (!nannyData.hourlyrate) {
        toast.error('Please enter your hourly rate.');
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.from('nannies').insert({
        user_id: user.id,
        bio: nannyData.bio,
        experience: nannyData.experience,
        hourlyrate: Number(nannyData.hourlyrate),
        location: nannyData.location,
        skills: nannyData.skills,
        availability: nannyData.availability,
        profile_image: imageUrl,
        email: user.email || null,
        name: user.name || null,
        phone: user.phone || null
      });

      if (error) {
        console.error('Error inserting nanny:', error);
        toast.error('Error saving nanny profile.');
      } else {
        toast.success('Nanny profile saved successfully!');
        navigate('/');
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
            <CardTitle className="text-2xl">Complete Your Profile (Nanny)</CardTitle>
            <p className="text-gray-600">Let families know about your experience and skills</p>
          </CardHeader>
          <CardContent>
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-4">
                <Label>Bio</Label>
                <Textarea
                  value={nannyData.bio}
                  onChange={e => setNannyData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  placeholder="Tell families about yourself..."
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Experience (years)</Label>
                    <Input
                      type="number"
                      value={nannyData.experience}
                      onChange={e => setNannyData(prev => ({ ...prev, experience: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Hourly Rate ($)</Label>
                    <Input
                      type="number"
                      value={nannyData.hourlyrate}
                      onChange={e => setNannyData(prev => ({ ...prev, hourlyrate: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label>Location</Label>
                  <Input
                    value={nannyData.location}
                    onChange={e => setNannyData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>

                <div>
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
                </div>

                <Button onClick={() => setStep(2)} className="w-full bg-green-600 hover:bg-green-700">
                  Next: Skills & Availability
                </Button>
              </div>
            )}

            {/* Step 2: Skills & Availability */}
            {step === 2 && (
              <div className="space-y-4">
                <Label>Skills</Label>
                <div className="flex gap-2">
                  <Input
                    value={nannyData.newSkill}
                    onChange={e => setNannyData(prev => ({ ...prev, newSkill: e.target.value }))}
                    placeholder="Add a skill"
                    onKeyPress={e => e.key === 'Enter' && handleAddSkill()}
                  />
                  <Button onClick={handleAddSkill} size="sm" className="bg-green-600 hover:bg-green-700">
                    <Plus />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {commonSkills.map(skill => (
                    <Badge
                      key={skill}
                      variant={nannyData.skills.includes(skill) ? 'default' : 'outline'}
                      className={`cursor-pointer ${nannyData.skills.includes(skill) ? 'bg-green-600 hover:bg-green-700' : ''}`}
                      onClick={() => {
                        if (nannyData.skills.includes(skill)) handleRemoveSkill(skill);
                        else setNannyData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
                      }}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>

                <Label>Availability</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availableDays.map(day => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        checked={nannyData.availability.includes(day)}
                        onCheckedChange={checked => handleAvailabilityChange(day, checked as boolean)}
                      />
                      <Label>{day}</Label>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleSubmit} disabled={isLoading || !user} className="flex-1 bg-green-600 hover:bg-green-700">
                    {isLoading ? 'Completing...' : 'Complete Profile'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}