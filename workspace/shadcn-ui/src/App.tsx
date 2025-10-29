import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "sonner";

import Index from "./pages/Index";
import NannyList from "./pages/NannyList";
import NannyProfile from "./pages/NannyProfile";
import BookingForm from "./pages/BookingForm";
import MyBookings from "./pages/MyBookings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ProfileSetup from "./pages/ProfileSetup";
import NannyDashboard from "./pages/NannyDashboard";
import AuthCallback from "./pages/AuthCallback";

function App() {
  return (
    <Router>
      {/* ✅ AuthProvider must be inside Router so useNavigate() works */}
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/nannies" element={<NannyList />} />
            <Route path="/nanny/:id" element={<NannyProfile />} />
            <Route path="/book/:id" element={<BookingForm />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="/nanny-dashboard" element={<NannyDashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/setup/:type" element={<ProfileSetup />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>

          {/* Global toast notifications */}
          <Toaster richColors position="top-right" />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
