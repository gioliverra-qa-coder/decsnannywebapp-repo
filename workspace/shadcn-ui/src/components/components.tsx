// src/components/Header.tsx
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <h1
          className="text-2xl font-bold text-green-600 cursor-pointer hover:text-green-700 transition-colors"
          onClick={() => navigate('/')}
        >
          DecsNanny
        </h1>

        {/* Navigation Buttons */}
        <div className="flex items-center space-x-4">
          {/* Always visible */}
          <Button variant="ghost" onClick={() => navigate('/nannies')}>
            Find Nannies
          </Button>

          {/* Conditional buttons based on auth */}
          {isAuthenticated ? (
            <>
              <Button variant="ghost" onClick={() => navigate('/bookings')}>
                My Bookings
              </Button>
              <Button variant="ghost" onClick={() => navigate('/profile')}>
                <User className="w-4 h-4 mr-2" />
                {user?.name}
              </Button>
            </>
          ) : (
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
