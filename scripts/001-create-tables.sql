-- Create custom enum for app roles
CREATE TYPE public.app_role AS ENUM ('sindico', 'porteiro', 'morador');

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text,
  avatar_url text,
  unit text,
  block text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- User roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  role public.app_role NOT NULL DEFAULT 'morador'
);

-- Packages table
CREATE TABLE IF NOT EXISTS public.packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block text NOT NULL DEFAULT '',
  unit text NOT NULL DEFAULT '',
  resident_name text NOT NULL DEFAULT '',
  resident_id uuid REFERENCES public.profiles(id),
  type text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pendente',
  photo_url text,
  received_at timestamptz NOT NULL DEFAULT now(),
  picked_up_at timestamptz,
  picked_up_by text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Visitors table
CREATE TABLE IF NOT EXISTS public.visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  document text NOT NULL DEFAULT '',
  block text NOT NULL DEFAULT '',
  unit text NOT NULL DEFAULT '',
  resident_name text NOT NULL DEFAULT '',
  vehicle text,
  status text NOT NULL DEFAULT 'dentro',
  entry_at timestamptz NOT NULL DEFAULT now(),
  exit_at timestamptz,
  registered_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Reservations table
CREATE TABLE IF NOT EXISTS public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space text NOT NULL,
  date date NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  resident_name text NOT NULL DEFAULT '',
  resident_id uuid REFERENCES public.profiles(id),
  block text NOT NULL DEFAULT '',
  unit text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pendente',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Notices table
CREATE TABLE IF NOT EXISTS public.notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL DEFAULT 'aviso',
  author_id uuid,
  author_name text NOT NULL DEFAULT '',
  date text,
  location text,
  is_new boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Occurrences table
CREATE TABLE IF NOT EXISTS public.occurrences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'aberta',
  resident_name text NOT NULL DEFAULT '',
  resident_id uuid,
  block text NOT NULL DEFAULT '',
  unit text NOT NULL DEFAULT '',
  photo_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Occurrence events table
CREATE TABLE IF NOT EXISTS public.occurrence_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurrence_id uuid NOT NULL REFERENCES public.occurrences(id),
  action text NOT NULL,
  performed_by text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.packages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.visitors;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.occurrences;
ALTER PUBLICATION supabase_realtime ADD TABLE public.occurrence_events;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.occurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.occurrence_events ENABLE ROW LEVEL SECURITY;

-- Permissive policies for authenticated users (allow all operations for now)
CREATE POLICY "Authenticated users can read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid()::text = user_id::text);
CREATE POLICY "Service role can insert profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read roles" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read packages" ON public.packages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert packages" ON public.packages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update packages" ON public.packages FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read visitors" ON public.visitors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert visitors" ON public.visitors FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update visitors" ON public.visitors FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read reservations" ON public.reservations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert reservations" ON public.reservations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update reservations" ON public.reservations FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read notices" ON public.notices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert notices" ON public.notices FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read occurrences" ON public.occurrences FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert occurrences" ON public.occurrences FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update occurrences" ON public.occurrences FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read occurrence_events" ON public.occurrence_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert occurrence_events" ON public.occurrence_events FOR INSERT TO authenticated WITH CHECK (true);

-- Helper functions used by the app
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS public.app_role
LANGUAGE sql STABLE
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_role public.app_role, _user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- Trigger to auto-create profile and role on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, unit, block)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'unit', ''),
    COALESCE(NEW.raw_user_meta_data->>'block', '')
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'morador')
  );
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users (only if not exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
