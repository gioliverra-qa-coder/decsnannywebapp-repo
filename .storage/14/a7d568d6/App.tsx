import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import NannyList from './pages/NannyList';
import NannyProfile from './pages/NannyProfile';
import BookingForm from './pages/BookingForm';
import MyBookings from './pages/MyBookings';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/nannies" element={<NannyList />} />
          <Route path="/nanny/:id" element={<NannyProfile />} />
          <Route path="/book/:id" element={<BookingForm />} />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;