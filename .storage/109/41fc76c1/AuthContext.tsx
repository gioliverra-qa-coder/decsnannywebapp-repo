import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, Booking } from '../types/user';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, userType: 'parent' | 'nanny') => Promise<boolean>;
  register: (userData: Partial<User>, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  updateBookingStatus: (bookingId: string, status: 'pending' | 'accepted' | 'declined' | 'completed' | 'delivered') => void;
  addBooking: (booking: Booking) => void;
  getBookings: () => Booking[];
  clearAllBookings: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    // Check for existing session on app load
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }

    // Clear all existing bookings and start fresh
    localStorage.setItem('bookings', JSON.stringify([]));
  }, []);

  const login = async (email: string, password: string, userType: 'parent' | 'nanny'): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create consistent user IDs for demo
      const userId = userType === 'parent' ? 'demo-parent' : 'demo-nanny';
      
      const mockUser: User = {
        id: userId,
        email,
        name: userType === 'parent' ? 'John Smith' : 'Sarah Johnson',
        phone: '+1 (555) 123-4567',
        userType,
        profileImage: userType === 'parent' 
          ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
          : 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
        createdAt: new Date().toISOString()
      };

      localStorage.setItem('currentUser', JSON.stringify(mockUser));
      setAuthState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false
      });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: Partial<User>, password: string): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email || '',
        name: userData.name || '',
        phone: userData.phone || '',
        userType: userData.userType || 'parent',
        profileImage: userData.profileImage,
        createdAt: new Date().toISOString()
      };

      localStorage.setItem('currentUser', JSON.stringify(newUser));
      setAuthState({
        user: newUser,
        isAuthenticated: true,
        isLoading: false
      });
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    try {
      if (!authState.user) return false;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUser = { ...authState.user, ...userData };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }));
      
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  };

  const updateBookingStatus = (bookingId: string, status: 'pending' | 'accepted' | 'declined' | 'completed' | 'delivered') => {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const updatedBookings = bookings.map((booking: Booking) => 
      booking.id === bookingId 
        ? { ...booking, status }
        : booking
    );
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
  };

  const addBooking = (booking: Booking) => {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
  };

  const getBookings = (): Booking[] => {
    return JSON.parse(localStorage.getItem('bookings') || '[]');
  };

  const clearAllBookings = () => {
    localStorage.setItem('bookings', JSON.stringify([]));
  };

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
    updateBookingStatus,
    addBooking,
    getBookings,
    clearAllBookings
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}