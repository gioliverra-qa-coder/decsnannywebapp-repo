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

  // ✅ Helper to set user in state and localStorage
  const authSetUser = (dbUser: any) => {
    const formattedUser: User = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      phone: dbUser.phone,
      userType: dbUser.user_type ?? dbUser.userType, // ✅ FIXED (handles both DB & app format)
      createdAt: dbUser.created_at || dbUser.createdAt || new Date().toISOString(),
    };

    localStorage.setItem("currentUser", JSON.stringify(formattedUser));
    setAuthState({ user: formattedUser, isAuthenticated: true, isLoading: false });
  };

  // ✅ Check session on load (Google OAuth + refresh persistence)
  useEffect(() => {
    const handleOAuthRedirect = async () => {
      const url = new URL(window.location.href);

      // ✅ Extract Google OAuth tokens from hash fragment
      if (url.hash.includes("access_token")) {
        const params = new URLSearchParams(url.hash.substring(1));
        await supabase.auth.setSession({
          access_token: params.get("access_token")!,
          refresh_token: params.get("refresh_token")!,
        });

        // ✅ Clean URL
        window.history.replaceState({}, "", "/auth/callback");
      }

      const { data } = await supabase.auth.getSession();
      const sessionUser = data?.session?.user;

      if (!sessionUser) {
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      // ✅ Check if user exists in your users table
      const { data: existingUser } = await supabase
        .from("users")
        .select("*")
        .eq("id", sessionUser.id)
        .maybeSingle();

      if (existingUser) {
        authSetUser(existingUser);
        navigate("/"); // ✅ Existing user goes home
      } else {
        // ✅ New Google user → continue registration
        setAuthState({
          user: {
            id: sessionUser.id,
            name: sessionUser.user_metadata.full_name || "",
            email: sessionUser.email || "",
            phone: "",
            userType: "", // still empty until registration step
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

  // ✅ Manual Login
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
      toast.error(err.message || "Unexpected error");
      return false;
    }
  };

  // ✅ Google Login
  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  // ✅ Register (manual or finishing Google signup)
  const register = async (userData: Partial<User>, password?: string): Promise<boolean> => {
    try {
      const { data: session } = await supabase.auth.getSession();
      let userId = session?.session?.user?.id;

      // ✅ Manual login flow (email/password)
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

      // ✅ Save user to DB
      await supabase.from("users").upsert({
        id: userId,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        user_type: userData.userType, // ✅ DB column
        created_at: new Date().toISOString(),
      });

      // ✅ Save authenticated user
      authSetUser({
        id: userId!,
        name: userData.name!,
        email: userData.email!,
        phone: userData.phone || "",
        userType: userData.userType!, // ✅ correct format
        createdAt: new Date().toISOString(),
      });

      // ✅ Redirect based on role
      navigate(
        userData.userType === "nanny"
          ? "/profile/setup/nanny"
          : "/profile/setup/parent"
      );

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
