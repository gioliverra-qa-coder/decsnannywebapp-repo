// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { User, AuthState, Booking } from "../types/user";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  register: (userData: Partial<User>, password?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  updateBookingStatus: (bookingId: string, status: any) => void;
  addBooking: (booking: Booking) => void;
  getBookings: () => Booking[];
  clearAllBookings: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // --- Handle Google OAuth redirect and session setup ---
  useEffect(() => {
    const handleOAuthRedirect = async () => {
      const url = new URL(window.location.href);

      // Extract tokens if returned via hash fragment
      if (url.hash.includes("access_token")) {
        const params = new URLSearchParams(url.hash.substring(1));
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");

        if (access_token) {
          await supabase.auth.setSession({
            access_token,
            refresh_token: refresh_token!,
          });

          // Clean URL
          window.history.replaceState({}, "", "/auth/callback");
        }
      }

      // Get session after setting tokens
      const { data } = await supabase.auth.getSession();
      const sessionUser = data?.session?.user;

      if (!sessionUser) {
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      // Check if user exists in DB
      const { data: existingUser } = await supabase
        .from("users")
        .select("*")
        .eq("id", sessionUser.id)
        .maybeSingle();

      if (existingUser) {
        // Existing user → redirect home
        authSetUser(existingUser);
        navigate("/");
      } else {
        // New Google user → go to register
        setAuthState({
          user: {
            id: sessionUser.id,
            name: sessionUser.user_metadata.full_name || "",
            email: sessionUser.email || "",
            phone: "",
            userType: "",
            createdAt: new Date().toISOString(),
          },
          isAuthenticated: false,
          isLoading: false,
        });
        navigate("/register");
      }
    };

    handleOAuthRedirect();
  }, []);

  const authSetUser = (dbUser: any) => {
    const formattedUser: User = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      phone: dbUser.phone,
      userType: dbUser.user_type,
      createdAt: dbUser.created_at || new Date().toISOString(),
    };

    localStorage.setItem("currentUser", JSON.stringify(formattedUser));
    setAuthState({ user: formattedUser, isAuthenticated: true, isLoading: false });
  };

  // --- Manual login ---
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        toast.error(error?.message || "Login failed");
        return false;
      }

      const { data: userRow } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!userRow) {
        toast.error("User not found in database.");
        return false;
      }

      authSetUser(userRow);
      toast.success("Welcome back!");
      navigate("/");
      return true;
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
      return false;
    }
  };

  // --- Google Login ---
  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  // --- Register (manual or Google user finishing setup) ---
  const register = async (userData: Partial<User>, password?: string): Promise<boolean> => {
    try {
      const { data: session } = await supabase.auth.getSession();
      let userId = session?.session?.user?.id;

      // Manual signup if no userId yet
      if (!userId && password) {
        const { data, error } = await supabase.auth.signUp({
          email: userData.email!,
          password,
        });
        if (error || !data.user) {
          toast.error(error?.message || "Registration failed");
          return false;
        }
        userId = data.user.id;
      }

      // Insert or update user row
      await supabase.from("users").upsert({
        id: userId,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        user_type: userData.userType,
        created_at: new Date().toISOString(),
      });

      authSetUser({
        id: userId!,
        name: userData.name!,
        email: userData.email!,
        phone: userData.phone || "",
        userType: userData.userType!,
        createdAt: new Date().toISOString(),
      });

      navigate("/");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("currentUser");
    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
    navigate("/login");
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    if (!authState.user) return false;
    const { error } = await supabase.from("users").update(userData).eq("id", authState.user.id);
    if (error) return false;

    authSetUser({ ...authState.user, ...userData });
    toast.success("Profile updated!");
    return true;
  };

  const updateBookingStatus = () => {};
  const addBooking = () => {};
  const getBookings = (): Booking[] => JSON.parse(localStorage.getItem("bookings") || "[]");
  const clearAllBookings = () => localStorage.setItem("bookings", JSON.stringify([]));

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        loginWithGoogle,
        register,
        logout,
        updateProfile,
        updateBookingStatus,
        addBooking,
        getBookings,
        clearAllBookings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
