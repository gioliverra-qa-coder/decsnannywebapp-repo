import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '../utils/supabaseClient';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // --- Manual login ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please enter your email and password');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        toast.success('Login successful!');
        navigate('/'); // ✅ Redirect to home
      } else {
        toast.error('Invalid email or password');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Google OAuth login ---
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error('Google login error:', error);
        toast.error(error.message || 'Failed to sign in with Google');
      }
    } catch (err: any) {
      console.error('Unexpected Google login error:', err);
      toast.error(err.message || 'Unexpected Google login issue');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-700">
              Sign In
            </CardTitle>
            <p className="text-gray-600">Welcome back! Please log in.</p>
          </CardHeader>

          <CardContent>
            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="Enter your email"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, password: e.target.value }))
                    }
                    placeholder="Enter your password"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>

              {/* OR Separator */}
              <div className="flex items-center justify-center mt-8 mb-4">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="px-3 text-gray-500 text-sm">or</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              {/* Google Login */}
              <Button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full bg-white border border-gray-300 flex items-center justify-center gap-2 hover:bg-gray-50 text-emerald-800 font-medium"
              >
                <svg className="w-5 h-5" viewBox="0 0 488 512">
                  <path
                    fill="#4285F4"
                    d="M488 261.8c0-17.4-1.6-34.2-4.7-50.4H249v95.6h134c-5.8 31.6-23.6 58.5-50.4 76.7v63.8h81.5c47.8-44 75.3-108.7 75.3-185.7z"
                  />
                  <path
                    fill="#34A853"
                    d="M249 512c67.5 0 124-22.5 165.3-61.1l-81.5-63.8c-22.7 15.3-51.8 24.4-83.8 24.4-64.4 0-119-43.6-138.3-102.2H27.5v64.1C69.5 457.3 153.2 512 249 512z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M110.7 313.5c-5.4-15.7-8.5-32.5-8.5-49.5s3.1-33.8 8.5-49.5V150H27.5C10.3 182.7 0 218 0 256s10.3 73.3 27.5 106l83.2-48.5z"
                  />
                  <path
                    fill="#EA4335"
                    d="M249 100.9c35.1 0 66.6 12 91.5 35.8l68.7-68.7C373 27.5 316.5 0 249 0 153.2 0 69.5 54.7 27.5 150l83.2 64.1c19.3-58.6 73.9-102.2 138.3-102.2z"
                  />
                </svg>
                Log in with Google
              </Button>
            </form>

            {/* Signup Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Don’t have an account?{' '}
                <Link
                  to="/register"
                  className="text-green-600 hover:underline font-medium"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
