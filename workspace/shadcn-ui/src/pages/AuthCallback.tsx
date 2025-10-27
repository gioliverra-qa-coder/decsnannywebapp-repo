import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { toast } from 'sonner';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        toast.error('No active session found.');
        navigate('/login');
        return;
      }

      const userId = session.user.id;

      // Check if user has a record in your custom "users" table
      const { data: userRow } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (userRow) {
        // ✅ Existing user — go to home
        navigate('/');
      } else {
        // 🆕 New Google user — go to register to finish setup
        navigate('/register');
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-gray-600">Signing you in...</p>
    </div>
  );
}
