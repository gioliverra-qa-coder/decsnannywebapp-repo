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
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; user?: User; access_token?: string }>;
  loginWithGoogle: () => Promise<void>;
  register: (userData: Partial<User>, password?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  updateBookingStatus: (bookingId: string, status: any) => void;
  addBooking: (booking: Booking) => Promise<{ success: boolean; message: string; booking?: Booking }>;
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
      userType: dbUser.user_type ?? dbUser.userType,
      createdAt: dbUser.created_at || dbUser.createdAt || new Date().toISOString(),
    };

    localStorage.setItem("currentUser", JSON.stringify(formattedUser));
    setAuthState({ user: formattedUser, isAuthenticated: true, isLoading: false });
  };

  // ✅ Check session on load
  useEffect(() => {
    const handleOAuthRedirect = async () => {
      const url = new URL(window.location.href);

      if (url.hash.includes("access_token")) {
        const params = new URLSearchParams(url.hash.substring(1));
        await supabase.auth.setSession({
          access_token: params.get("access_token")!,
          refresh_token: params.get("refresh_token")!,
        });

        window.history.replaceState({}, "", "/auth/callback");
      }

      const { data } = await supabase.auth.getSession();
      const sessionUser = data?.session?.user;

      if (!sessionUser) {
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      const { data: existingUser } = await supabase
        .from("users")
        .select("*")
        .eq("id", sessionUser.id)
        .maybeSingle();

      if (existingUser) {
        authSetUser(existingUser);
        navigate("/");
      } else {
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

  // ✅ Manual Login
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        toast.error(error?.message || "Invalid email or password");
        return { success: false };
      }

      const { data: userRow, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();

      if (userError || !userRow) {
        toast.error("User not found in database.");
        return { success: false };
      }

      authSetUser(userRow);

      toast.success("Login successful!");
      navigate("/");

      return { success: true };

    } catch (err: any) {
      toast.error("Unexpected error. Please try again.");
      return { success: false };
    }
  };
  // ✅ Google Login
  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  // ✅ Register
  const register = async (userData: Partial<User>, password?: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      let userId = session?.session?.user?.id;

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

      navigate(userData.userType === "nanny" ? "/profile/setup/nanny" : "/profile/setup/parent");
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

  const updateProfile = async (userData: Partial<User>) => {
    if (!authState.user) return false;

    const { error } = await supabase.from("users").update(userData).eq("id", authState.user.id);
    if (error) return false;

    authSetUser({ ...authState.user, ...userData });
    toast.success("Profile updated!");
    return true;
  };

  // ✅ Booking functions
  const updateBookingStatus = () => { };

  const addBooking = async (booking: Booking) => {
    try {
      const { error, data: inserted } = await supabase.from("bookings").insert([booking]).select();
      if (error) {
        toast.error("Failed to create booking");
        return { success: false, message: "Failed to create booking" };
      }

      // Optionally update local storage
      const currentBookings = JSON.parse(localStorage.getItem("bookings") || "[]");
      localStorage.setItem("bookings", JSON.stringify([...currentBookings, inserted[0]]));

      toast.success("Booking created successfully");
      return { success: true, message: "Booking created successfully", booking: inserted[0] };
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error creating booking");
      return { success: false, message: "Unexpected error creating booking" };
    }
  };

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