// src/pages/Register.tsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, Phone } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../contexts/AuthContext"; // ✅ Now imported from AuthContext

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    userType: "" as "parent" | "nanny" | "",
  });

  /** ✅ Prefill name & email for Google users */
  useEffect(() => {
    const fillGoogleUser = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (user && user.app_metadata?.provider === "google") {
        setIsGoogleUser(true);
        setFormData((prev) => ({
          ...prev,
          name: user.user_metadata.full_name || "",
          email: user.email || "",
        }));
      }
    };

    fillGoogleUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /** ✅ Submit registration form */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Validation for required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.userType) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!isGoogleUser) {
      if (!formData.password || !formData.confirmPassword) {
        toast.error("Password and confirmation are required.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }
      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters.");
        return;
      }
    }

    setIsLoading(true);
    try {
      const success = await register(
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          userType: formData.userType,
        },
        isGoogleUser ? undefined : formData.password // ✅ skip password for Google
      );

      if (!success) {
        toast.error("Registration failed.");
        return;
      }

      toast.success("Registration successful! 🎉");
      if (formData.userType === 'nanny') {
        navigate('/profile/setup/nanny');
      } else {
        navigate('/profile/setup/parent');
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-700">
              {isGoogleUser ? "Complete Your Profile" : "Create an Account"}
            </CardTitle>
            <p className="text-gray-600">
              {isGoogleUser ? "Just a few more details..." : "Join our community today!"}
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="Enter your name"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    disabled={isGoogleUser}
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>

              {/* User Type */}
              <div className="space-y-2">
                <Label htmlFor="userType">I am a...</Label>
                <select
                  id="userType"
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  className="w-full border rounded-md py-2 px-3 focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select your role</option>
                  <option value="parent">Parent</option>
                  <option value="nanny">Nanny</option>
                </select>
              </div>

              {/* Password — Only visible for manual registration */}
              {!isGoogleUser && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-10"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="pl-10"
                        placeholder="Confirm your password"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? "Saving..." : isGoogleUser ? "Continue" : "Create Account"}
              </Button>
            </form>

            {/* Footer */}
            {!isGoogleUser && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link to="/login" className="text-green-600 hover:underline font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
