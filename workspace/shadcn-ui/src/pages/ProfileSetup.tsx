import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '../utils/supabaseClient';

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [nannyData, setNannyData] = useState({
    bio: '',
    experience: '',
    hourlyrate: '',
    location: '',
    skills: [] as string[],
    availability: [] as string[],
    newSkill: ''
  });

  const [parentData, setParentData] = useState({
    address: '',
    children: [{ name: '', age: '' }],
    emergencyContact: { name: '', phone: '', relationship: '' }
  });

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

  const handleSubmit = async () => {
  setIsLoading(true);

  try {
    if (user?.userType === 'nanny') {
      if (!nannyData.hourlyrate) {
        toast.error('Please enter your hourly rate.');
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.from('nannies').insert({
        user_id: user.id,                 // <-- use user.id directly
        bio: nannyData.bio,
        experience: nannyData.experience,
        hourlyrate: Number(nannyData.hourlyrate),
        location: nannyData.location,
        skills: nannyData.skills,
        availability: nannyData.availability,
        profile_image: user?.profileImage || null,
        email: user?.email || null,
        name: user?.name || null,
        phone: user?.phone || null
      });

      if (error) {
        console.error('Error inserting nanny:', error);
        toast.error('Error saving nanny profile.');
      } else {
        toast.success('Nanny profile saved successfully!');
        navigate('/profile');
      }

    } else {
      const { error } = await supabase.from('parents').insert({
        user_id: user.id,                 // <-- use user.id directly
        address: parentData.address,
        children: parentData.children,
        emergency_contact: parentData.emergencyContact,
        profile_image: user?.profileImage || null,
        email: user?.email || null,
        name: user?.name || null,
        phone: user?.phone || null
      });

      if (error) {
        console.error('Error inserting parent:', error);
        toast.error('Error saving parent profile.');
      } else {
        toast.success('Parent profile saved successfully!');
        navigate('/profile');
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    toast.error('Something went wrong. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

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
          <div></div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <p className="text-gray-600">
              {user?.userType === 'nanny'
                ? 'Let families know about your experience and skills'
                : 'Tell us about your family and childcare needs'}
            </p>
          </CardHeader>
          <CardContent>
            {user?.userType === 'nanny' ? (
              <div className="space-y-6">
                {step === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={nannyData.bio}
                        onChange={e => setNannyData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell families about yourself..."
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="experience">Years of Experience</Label>
                        <Input
                          id="experience"
                          type="number"
                          value={nannyData.experience}
                          onChange={e => setNannyData(prev => ({ ...prev, experience: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hourlyrate">Hourly Rate ($)</Label>
                        <Input
                          id="hourlyrate"
                          type="number"
                          value={nannyData.hourlyrate}
                          onChange={e => setNannyData(prev => ({ ...prev, hourlyrate: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={nannyData.location}
                        onChange={e => setNannyData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="City / Area"
                      />
                    </div>

                    <Button onClick={() => setStep(2)} className="w-full bg-green-600 hover:bg-green-700">
                      Next: Skills & Availability
                    </Button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Skills & Availability</h3>

                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          value={nannyData.newSkill}
                          onChange={e => setNannyData(prev => ({ ...prev, newSkill: e.target.value }))}
                          placeholder="Add a skill or certification"
                          onKeyPress={e => e.key === 'Enter' && handleAddSkill()}
                        />
                        <Button onClick={handleAddSkill} size="sm" className="bg-green-600 hover:bg-green-700">
                          <Plus className="w-4 h-4" />
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
                    </div>

                    <div className="space-y-2">
                      <Label>Availability</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {availableDays.map(day => (
                          <div key={day} className="flex items-center space-x-2">
                            <Checkbox
                              id={day}
                              checked={nannyData.availability.includes(day)}
                              onCheckedChange={checked => handleAvailabilityChange(day, checked as boolean)}
                            />
                            <Label htmlFor={day}>{day}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                        Back
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={isLoading || !user}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {isLoading ? 'Completing...' : 'Complete Profile'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Family Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="address">Home Address</Label>
                  <Input
                    id="address"
                    value={parentData.address}
                    onChange={e => setParentData(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Children</Label>
                    <Button onClick={addChild} size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" /> Add Child
                    </Button>
                  </div>

                  {parentData.children.map((child, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <Input
                        value={child.name}
                        placeholder="Name"
                        onChange={e => handleChildChange(index, 'name', e.target.value)}
                      />
                      <Input
                        type="number"
                        value={child.age}
                        placeholder="Age"
                        onChange={e => handleChildChange(index, 'age', e.target.value)}
                      />
                      {parentData.children.length > 1 && (
                        <Button onClick={() => removeChild(index)} size="sm" variant="outline">
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <Label>Emergency Contact</Label>
                  <Input
                    placeholder="Name"
                    value={parentData.emergencyContact.name}
                    onChange={e => setParentData(prev => ({
                      ...prev,
                      emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                    }))}
                  />
                  <Input
                    placeholder="Phone"
                    value={parentData.emergencyContact.phone}
                    onChange={e => setParentData(prev => ({
                      ...prev,
                      emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                    }))}
                  />
                  <Input
                    placeholder="Relationship"
                    value={parentData.emergencyContact.relationship}
                    onChange={e => setParentData(prev => ({
                      ...prev,
                      emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                    }))}
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !user}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? 'Completing...' : 'Complete Profile'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
