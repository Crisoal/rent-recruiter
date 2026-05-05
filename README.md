# Accretio — Rent a Recruiter Platform

A full-stack web application connecting companies with elite recruiters through flexible hire or rent engagements.

## 🚀 Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Routing**: React Router v7
- **Icons**: Lucide React

## 🎨 Design System

### Colors
- **Primary**: `#0D1B4B` (Deep Navy)
- **Accent**: `#00C853` (Accretio Green)
- **Supporting**: `#00897B` (Soft Teal)
- **Neutral**: `#F0F4FF` (Light Slate)

### Typography
- **Font**: Inter
- **Body text**: 13-14px
- **Labels/captions**: 11-12px
- **Headings**: Max 24-28px

### Design Style
- Clean, minimalistic, modern
- Lots of white space
- Subtle shadows and rounded corners (12-16px)
- Smooth hover transitions and micro-animations
- Skeleton loaders while data fetches
- Toast notifications for all user actions

## 👥 User Roles

1. **Client** - Post requisitions, browse recruiters, manage applications
2. **Recruiter** - Apply to requisitions, manage profile, receive direct requests
3. **Admin** - Approve/reject requisitions, manage users

## 📦 Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the Supabase migration:
   ```bash
   # Apply the schema from supabase/migrations/20260425172020_create_accretio_schema.sql
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## 🗂️ Project Structure

```
src/
├── components/
│   ├── layout/          # DashboardLayout, Navbar
│   └── ui/              # Button, Badge, Input, Modal, Skeleton
├── contexts/            # AuthContext, ToastContext
├── lib/                 # Supabase client, TypeScript types
├── pages/
│   ├── admin/          # Admin dashboard pages
│   ├── client/         # Client dashboard pages
│   ├── recruiter/      # Recruiter dashboard pages
│   ├── Landing.tsx     # Public landing page
│   ├── Login.tsx       # Login page
│   ├── Signup.tsx      # Signup with role selection
│   ├── RecruiterDirectory.tsx
│   └── RecruiterProfile.tsx
└── App.tsx             # Main app with routing
```

## 🔑 Key Features

### Client Features
- Create and manage job requisitions
- Browse recruiter directory with filters
- Send direct hire/rent requests to recruiters
- Review and select recruiter applications
- Track requisition status (pending, approved, rejected, closed)

### Recruiter Features
- Complete profile with specialties, industries, availability
- Browse and apply to approved requisitions
- Manage applications and track status
- Receive and respond to direct requests from clients
- Profile completion tracking

### Admin Features
- Review and approve/reject requisitions
- View all users (clients and recruiters)
- Platform oversight dashboard
- Rejection reason tracking

## 📊 Database Schema

- `users` - User accounts with role
- `client_profiles` - Client company information
- `recruiter_profiles` - Recruiter details and availability
- `requisitions` - Job postings with person specifications
- `applications` - Recruiter applications to requisitions
- `direct_requests` - Direct hire/rent requests

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Role-based access control
- Protected routes with authentication checks
- Supabase Auth integration

## 🎯 Status Badges

The platform uses color-coded status badges:
- **Pending** - Amber
- **Approved** - Green
- **Rejected** - Red
- **Closed** - Gray
- **Hire** - Navy
- **Rent** - Teal

## 📱 Mobile Responsive

All pages are fully responsive with:
- Mobile-friendly navigation
- Collapsible sidebars
- Touch-optimized interactions
- Responsive grid layouts

## 🚦 Getting Started

1. Visit the landing page
2. Sign up as a Client or Recruiter
3. Complete your profile
4. Start posting requisitions (Client) or applying to opportunities (Recruiter)

## 📝 License

Private project - All rights reserved
