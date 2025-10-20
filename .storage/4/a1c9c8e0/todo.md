# Nanny Booking App - MVP Todo

## Overview
A simple nanny booking application where users can browse available nannies, view their profiles, and book appointments.

## Core Features (MVP)
1. Nanny listing page with search/filter functionality
2. Individual nanny profile pages with details and availability
3. Booking form and confirmation
4. Simple booking management (view bookings)

## Files to Create/Modify

### 1. src/pages/Index.tsx
- Main landing page with hero section
- Featured nannies preview
- Call-to-action buttons

### 2. src/pages/NannyList.tsx
- Display grid of available nannies
- Search and filter functionality (by location, experience, hourly rate)
- Nanny cards with basic info and "View Profile" button

### 3. src/pages/NannyProfile.tsx
- Detailed nanny information (photo, bio, experience, skills, reviews)
- Availability calendar
- "Book Now" button

### 4. src/pages/BookingForm.tsx
- Form to select date/time, duration, special requirements
- Contact information input
- Booking confirmation

### 5. src/pages/MyBookings.tsx
- List of user's current and past bookings
- Booking status and details

### 6. src/components/NannyCard.tsx
- Reusable component for nanny preview cards
- Shows photo, name, rating, hourly rate, brief description

### 7. src/components/BookingCard.tsx
- Reusable component for displaying booking information

### 8. src/App.tsx
- Update routing to include all new pages

## Data Structure (Mock Data)
- Nannies: id, name, photo, bio, experience, skills, hourly_rate, rating, location, availability
- Bookings: id, nanny_id, date, time, duration, status, user_contact

## Tech Stack
- React with TypeScript
- shadcn/ui components
- React Router for navigation
- Local state management (useState/useContext)
- Mock data (no backend for MVP)