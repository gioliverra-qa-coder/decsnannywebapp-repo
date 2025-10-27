import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, AuthState, Booking } from '../types/user';
import { toast } from 'sonner';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Partial<User>, password?: string) => Promise<boolean>;
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
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data?.session?.user;

      if (sessionUser) {
        const { data: userRow } = await supabase
          .from('users')
          .select('*')
          .eq('id', sessionUser.id)
          .maybeSingle();

        if (userRow) {
          const user: User = {
            id: userRow.id,
            name: userRow.name,
            email: userRow.email,
            phone: userRow.phone,
            userType: userRow.user_type,
            createdAt: userRow.created_at,
          };
          localStorage.setItem('currentUser', JSON.stringify(user));
          setAuthState({ user, isAuthenticated: true, isLoading: false });
        } else {
          // No user row yet (like a new Google user)
          setAuthState({
            user: {
              id: sessionUser.id,
              name: sessionUser.user_metadata?.full_name || '',
              email: sessionUser.email || '',
              phone: '',
              userType: '',
              createdAt: new Date().toISOString(),
            },
            isAuthenticated: true,
            isLoading: false,
          });
        }
      } else {
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      }
    };

    loadSession();
  }, []);

  // --- LOGIN (manual) ---
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        toast.error(error?.message || 'Login failed');
        return false;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('id, name, email, phone, user_type')
        .eq('id', data.user.id)
        .maybeSingle();

      if (!userData) {
        toast.error('User record not found');
        return false;
      }

      const loggedUser: User = {
        id: data.user.id,
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
      toast.error(err.message || 'An unexpected error occurred');
      return false;
    }
  };

  // --- REGISTER (manual or Google user completing setup) ---
  const register = async (userData: Partial<User>, password?: string): Promise<boolean> => {
    try {
      let userId: string | null = null;

      // Check if already logged in (Google flow)
      const { data: sessionData } = await supabase.auth.getSession();
      const existingUser = sessionData?.session?.user;

      if (existingUser) {
        // ✅ Google user (already has an account)
        userId = existingUser.id;
      } else {
        // ✅ Manual registration
        const { data, error } = await supabase.auth.signUp({
          email: userData.email!,
          password: password!,
        });

        if (error || !data.user) {
          toast.error(error?.message || 'Registration failed');
          return false;
        }

        userId = data.user.id;
      }

      // --- Upsert user record into `users` table ---
      const { error: insertError } = await supabase.from('users').upsert({
        id: userId,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        user_type: userData.userType,
        created_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error('Error creating/updating user row:', insertError);
        toast.error('Failed to save user record');
        return false;
      }

      const newUser: User = {
        id: userId!,
        name: userData.name!,
        email: userData.email!,
        phone: userData.phone || '',
        userType: userData.userType!,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem('currentUser', JSON.stringify(newUser));
      setAuthState({ user: newUser, isAuthenticated: true, isLoading: false });

      return true;
    } catch (err: any) {
      console.error('Registration error:', err);
      toast.error(err.message || 'Registration failed');
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('currentUser');
    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    if (!authState.user) return false;
    try {
      const { error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', authState.user.id);
      if (error) throw error;
      const updatedUser = { ...authState.user, ...userData };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setAuthState({ ...authState, user: updatedUser });
      toast.success('Profile updated!');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
      return false;
    }
  };

  const updateBookingStatus = (bookingId: string, status: any) => {};
  const addBooking = (booking: Booking) => {};
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