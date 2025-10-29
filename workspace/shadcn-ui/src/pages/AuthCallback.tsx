// src/pages/AuthCallback.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const processLogin = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData?.session?.user;

      if (!sessionUser) {
        toast.error("Login failed.");
        navigate("/login");
        return;
      }

      // ✅ Check if this user already exists in DB users table
      const { data: userRow } = await supabase
        .from("users")
        .select("id, user_type")
        .eq("id", sessionUser.id)
        .maybeSingle();

      if (userRow) {
        // ✅ Existing user → go home
        navigate("/");
      } else {
        // 🚨 New Google user → needs to finish registration
        navigate("/register");
      }
    };

    processLogin();
  }, [navigate]);

  return <p>Signing you in...</p>;
}
