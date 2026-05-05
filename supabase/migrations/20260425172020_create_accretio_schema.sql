/*
  # Accretio Platform - Full Schema

  ## Overview
  Creates the complete database schema for the Accretio "Rent a Recruiter" platform.

  ## New Tables

  1. `users` - Links to Supabase auth.users, stores role (client/recruiter/admin)
  2. `client_profiles` - Client company details
  3. `recruiter_profiles` - Recruiter details including specialties, bio, availability
  4. `requisitions` - Job requisitions posted by clients
  5. `applications` - Recruiter applications to requisitions
  6. `direct_requests` - Direct hire/rent requests from clients to recruiters

  ## Security
  - RLS enabled on all tables
  - Policies scoped by role and ownership
  - Public read access on recruiter profiles and approved requisitions
*/

-- Users table (mirrors auth.users with role)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('client', 'recruiter', 'admin')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own record"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own record"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own record"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- Client profiles
CREATE TABLE IF NOT EXISTS client_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name text DEFAULT '',
  industry text DEFAULT '',
  location text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can read own profile"
  ON client_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Clients can insert own profile"
  ON client_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Clients can update own profile"
  ON client_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can read all client profiles"
  ON client_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE POLICY "Recruiters can read client profiles for requests"
  ON client_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'recruiter')
  );

-- Recruiter profiles
CREATE TABLE IF NOT EXISTS recruiter_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  bio text DEFAULT '',
  specialties text[] DEFAULT '{}',
  experience_years integer DEFAULT 0,
  industries text[] DEFAULT '{}',
  availability_status text DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'open_to_offers')),
  photo_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE recruiter_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read recruiter profiles"
  ON recruiter_profiles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Recruiters can insert own profile"
  ON recruiter_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Recruiters can update own profile"
  ON recruiter_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Requisitions
CREATE TABLE IF NOT EXISTS requisitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_title text NOT NULL DEFAULT '',
  department text DEFAULT '',
  employment_type text DEFAULT '',
  engagement_type text NOT NULL CHECK (engagement_type IN ('hire', 'rent')),
  duration text DEFAULT '',
  description text DEFAULT '',
  person_specification jsonb DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'closed')),
  rejection_reason text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE requisitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can read own requisitions"
  ON requisitions FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id);

CREATE POLICY "Clients can insert own requisitions"
  ON requisitions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update own requisitions"
  ON requisitions FOR UPDATE
  TO authenticated
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Recruiters can read approved requisitions"
  ON requisitions FOR SELECT
  TO authenticated
  USING (
    status = 'approved' AND
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'recruiter')
  );

CREATE POLICY "Admin can read all requisitions"
  ON requisitions FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE POLICY "Admin can update all requisitions"
  ON requisitions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- Applications
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requisition_id uuid NOT NULL REFERENCES requisitions(id) ON DELETE CASCADE,
  recruiter_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cover_note text DEFAULT '',
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'selected', 'not_selected')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(requisition_id, recruiter_id)
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recruiters can read own applications"
  ON applications FOR SELECT
  TO authenticated
  USING (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can insert own applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = recruiter_id);

CREATE POLICY "Clients can read applications for their requisitions"
  ON applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM requisitions r
      WHERE r.id = applications.requisition_id AND r.client_id = auth.uid()
    )
  );

CREATE POLICY "Clients can update applications for their requisitions"
  ON applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM requisitions r
      WHERE r.id = applications.requisition_id AND r.client_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM requisitions r
      WHERE r.id = applications.requisition_id AND r.client_id = auth.uid()
    )
  );

CREATE POLICY "Admin can read all applications"
  ON applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- Direct requests
CREATE TABLE IF NOT EXISTS direct_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recruiter_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  engagement_type text NOT NULL CHECK (engagement_type IN ('hire', 'rent')),
  duration text DEFAULT '',
  message text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE direct_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can read own direct requests"
  ON direct_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id);

CREATE POLICY "Clients can insert own direct requests"
  ON direct_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Recruiters can read their direct requests"
  ON direct_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can update their direct requests"
  ON direct_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = recruiter_id)
  WITH CHECK (auth.uid() = recruiter_id);

CREATE POLICY "Admin can read all direct requests"
  ON direct_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );
