import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, AuthState, Booking } from '../types/user';
import { toast } from 'sonner';

// --- Supabase setup ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Partial<User>, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  updateBookingStatus: (
    bookingId: string,
    status: 'pending' | 'accepted' | 'declined' | 'completed' | 'delivered'
  ) => void;
  addBooking: (booking: Booking) => void;
  getBookings: () => Booking[];
  clearAllBookings: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setAuthState({ user, isAuthenticated: true, isLoading: false });
      } catch {
        localStorage.removeItem('currentUser');
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }

    // Initialize empty bookings
    localStorage.setItem('bookings', JSON.stringify([]));
  }, []);

  // --- LOGIN ---
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // 1️⃣ Sign in
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error || !data.user) {
        toast.error(error?.message || 'Login failed');
        return false;
      }

      const user = data.user;

      // 2️⃣ Fetch user type from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name, email, phone, user_type')
        .eq('id', user.id)
        .single();

      if (userError || !userData) {
        toast.error('User record not found');
        return false;
      }

      const loggedUser: User = {
        id: user.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        userType: userData.user_type,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem('currentUser', JSON.stringify(loggedUser));
      setAuthState({ user: loggedUser, isAuthenticated: true, isLoading: false });

      toast.success('Login successful!');
      return true;
    } catch (err: any) {
      console.error('Unexpected login error:', err);
      toast.error(err.message || 'An unexpected error occurred');
      return false;
    }
  };

  // --- REGISTER ---
  const register = async (userData: Partial<User>, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email!,
        password,
      });

      if (error || !data.user) {
        toast.error(error?.message || 'Registration failed');
        return false;
      }

      // Insert base user record into "users" table
      const { error: insertError } = await supabase.from('users').insert({
        id: data.user.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        user_type: userData.userType,
        created_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error('Error creating user row:', insertError);
        toast.error('Failed to create user record');
        return false;
      }

      const newUser: User = {
        id: data.user.id,
        name: userData.name!,
        email: userData.email!,
        phone: userData.phone || '',
        userType: userData.userType!,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem('currentUser', JSON.stringify(newUser));
      setAuthState({ user: newUser, isAuthenticated: true, isLoading: false });

      toast.success('Registration successful!');
      return true;
    } catch (err: any) {
      console.error('Registration error:', err);
      toast.error(err.message || 'Registration failed');
      return false;
    }
  };

  // --- LOGOUT ---
  const logout = () => {
    supabase.auth.signOut();
    localStorage.removeItem('currentUser');
    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
  };

  // --- PROFILE UPDATE ---
  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    if (!authState.user) return false;

    try {
      const table = authState.user.userType === 'parent' ? 'parents' : 'nannies';
      const { error } = await supabase.from(table).update(userData).eq('user_id', authState.user.id);

      if (error) throw error;

      const updatedUser = { ...authState.user, ...userData };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setAuthState((prev) => ({ ...prev, user: updatedUser }));
      toast.success('Profile updated!');
      return true;
    } catch (err: any) {
      console.error('Profile update error:', err);
      toast.error(err.message || 'Failed to update profile');
      return false;
    }
  };

  // --- BOOKINGS (localStorage) ---
  const updateBookingStatus = (
    bookingId: string,
    status: 'pending' | 'accepted' | 'declined' | 'completed' | 'delivered'
  ) => {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const updatedBookings = bookings.map((b: Booking) =>
      b.id === bookingId ? { ...b, status } : b
    );
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
  };

  const addBooking = (booking: Booking) => {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
  };

  const getBookings = (): Booking[] => JSON.parse(localStorage.getItem('bookings') || '[]');
  const clearAllBookings = () => localStorage.setItem('bookings', JSON.stringify([]));

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
    updateBookingStatus,
    addBooking,
    getBookings,
    clearAllBookings,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}