import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface NannyCardProps {
  nanny: {
    id: number;
    name: string;
    bio: string;
    skills: string[] | null;
    location: string;
    hourlyrate: number;
    experience: number;
  };
}

export default function NannyCard({ nanny }: NannyCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-bold">{nanny.name}</CardTitle>
        <CardDescription className="text-gray-500 text-sm">{nanny.location}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-gray-700">{nanny.bio}</p>
        <div className="flex flex-wrap gap-2">
          {(nanny.skills || []).map((skill, idx) => (
            <span
              key={idx}
              className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs"
            >
              {skill}
            </span>
          ))}
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-600">Experience: {nanny.experience} yrs</span>
          <span className="text-sm text-gray-600">Rate: ${nanny.hourlyrate}/hr</span>
        </div>
      </CardContent>
    </Card>
  );
}
