-- Helper function to get current user's role without triggering RLS recursion
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$;

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own record" ON users;
DROP POLICY IF EXISTS "Users can insert own record" ON users;
DROP POLICY IF EXISTS "Users can update own record" ON users;
DROP POLICY IF EXISTS "Admin can read all users" ON users;

DROP POLICY IF EXISTS "Clients can read own profile" ON client_profiles;
DROP POLICY IF EXISTS "Clients can insert own profile" ON client_profiles;
DROP POLICY IF EXISTS "Clients can update own profile" ON client_profiles;
DROP POLICY IF EXISTS "Admin can read all client profiles" ON client_profiles;
DROP POLICY IF EXISTS "Recruiters can read client profiles for requests" ON client_profiles;

DROP POLICY IF EXISTS "Anyone can read recruiter profiles" ON recruiter_profiles;
DROP POLICY IF EXISTS "Recruiters can insert own profile" ON recruiter_profiles;
DROP POLICY IF EXISTS "Recruiters can update own profile" ON recruiter_profiles;

DROP POLICY IF EXISTS "Clients can read own requisitions" ON requisitions;
DROP POLICY IF EXISTS "Clients can insert own requisitions" ON requisitions;
DROP POLICY IF EXISTS "Clients can update own requisitions" ON requisitions;
DROP POLICY IF EXISTS "Recruiters can read approved requisitions" ON requisitions;
DROP POLICY IF EXISTS "Admin can read all requisitions" ON requisitions;
DROP POLICY IF EXISTS "Admin can update all requisitions" ON requisitions;

DROP POLICY IF EXISTS "Recruiters can read own applications" ON applications;
DROP POLICY IF EXISTS "Recruiters can insert own applications" ON applications;
DROP POLICY IF EXISTS "Clients can read applications for their requisitions" ON applications;
DROP POLICY IF EXISTS "Clients can update applications for their requisitions" ON applications;
DROP POLICY IF EXISTS "Admin can read all applications" ON applications;

DROP POLICY IF EXISTS "Clients can read own direct requests" ON direct_requests;
DROP POLICY IF EXISTS "Clients can insert own direct requests" ON direct_requests;
DROP POLICY IF EXISTS "Recruiters can read their direct requests" ON direct_requests;
DROP POLICY IF EXISTS "Recruiters can update their direct requests" ON direct_requests;
DROP POLICY IF EXISTS "Admin can read all direct requests" ON direct_requests;

-- Recreate all policies

-- users
CREATE POLICY "Users can read own record"
  ON users FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own record"
  ON users FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own record"
  ON users FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin can read all users"
  ON users FOR SELECT TO authenticated
  USING (get_my_role() = 'admin');

-- client_profiles
CREATE POLICY "Clients can read own profile"
  ON client_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Clients can insert own profile"
  ON client_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Clients can update own profile"
  ON client_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can read all client profiles"
  ON client_profiles FOR SELECT TO authenticated
  USING (get_my_role() = 'admin');

CREATE POLICY "Recruiters can read client profiles for requests"
  ON client_profiles FOR SELECT TO authenticated
  USING (get_my_role() = 'recruiter');

-- recruiter_profiles
CREATE POLICY "Anyone can read recruiter profiles"
  ON recruiter_profiles FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Recruiters can insert own profile"
  ON recruiter_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Recruiters can update own profile"
  ON recruiter_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- requisitions
CREATE POLICY "Clients can read own requisitions"
  ON requisitions FOR SELECT TO authenticated
  USING (auth.uid() = client_id);

CREATE POLICY "Clients can insert own requisitions"
  ON requisitions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update own requisitions"
  ON requisitions FOR UPDATE TO authenticated
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Recruiters can read approved requisitions"
  ON requisitions FOR SELECT TO authenticated
  USING (status = 'approved' AND get_my_role() = 'recruiter');

CREATE POLICY "Admin can read all requisitions"
  ON requisitions FOR SELECT TO authenticated
  USING (get_my_role() = 'admin');

CREATE POLICY "Admin can update all requisitions"
  ON requisitions FOR UPDATE TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- applications
CREATE POLICY "Recruiters can read own applications"
  ON applications FOR SELECT TO authenticated
  USING (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can insert own applications"
  ON applications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = recruiter_id);

CREATE POLICY "Clients can read applications for their requisitions"
  ON applications FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM requisitions r
      WHERE r.id = applications.requisition_id AND r.client_id = auth.uid()
    )
  );

CREATE POLICY "Clients can update applications for their requisitions"
  ON applications FOR UPDATE TO authenticated
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
  ON applications FOR SELECT TO authenticated
  USING (get_my_role() = 'admin');

-- direct_requests
CREATE POLICY "Clients can read own direct requests"
  ON direct_requests FOR SELECT TO authenticated
  USING (auth.uid() = client_id);

CREATE POLICY "Clients can insert own direct requests"
  ON direct_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Recruiters can read their direct requests"
  ON direct_requests FOR SELECT TO authenticated
  USING (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can update their direct requests"
  ON direct_requests FOR UPDATE TO authenticated
  USING (auth.uid() = recruiter_id)
  WITH CHECK (auth.uid() = recruiter_id);

CREATE POLICY "Admin can read all direct requests"
  ON direct_requests FOR SELECT TO authenticated
  USING (get_my_role() = 'admin');
