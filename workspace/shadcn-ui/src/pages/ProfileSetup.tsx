import { useAuth } from '../contexts/AuthContext';
import ProfileSetupNanny from './ProfileSetupNanny';
import ProfileSetupParent from './ProfileSetupParent';

export default function ProfileSetup() {
  const { user } = useAuth();

  if (!user) return <p>Please log in</p>;

  return user.userType === 'nanny' ? <ProfileSetupNanny /> : <ProfileSetupParent />;
}