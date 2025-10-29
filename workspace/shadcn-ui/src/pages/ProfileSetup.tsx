import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProfileSetupNanny from './ProfileSetupNanny';
import ProfileSetupParent from './ProfileSetupParent';

export default function ProfileSetup() {
  const { user } = useAuth();
  const { type } = useParams<{ type: 'nanny' | 'parent' }>();

  if (!user) return <p>Please log in</p>;

  return type === 'nanny' ? <ProfileSetupNanny /> : <ProfileSetupParent />;
}