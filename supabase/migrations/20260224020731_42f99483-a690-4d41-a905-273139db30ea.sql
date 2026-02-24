
-- Role enum
CREATE TYPE public.app_role AS ENUM ('sindico', 'porteiro', 'morador');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  unit TEXT DEFAULT '',
  block TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'morador',
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Profiles RLS policies
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Sindico can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'sindico'));

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Sindico can insert profiles"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'sindico') OR auth.uid() = user_id);

-- User roles RLS policies
CREATE POLICY "Users can view own role"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Sindico can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'sindico'));

CREATE POLICY "Sindico can manage roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'sindico'));

CREATE POLICY "Sindico can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'sindico'));

-- Packages table
CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'caixa',
  description TEXT NOT NULL DEFAULT '',
  resident_id UUID REFERENCES public.profiles(id),
  resident_name TEXT NOT NULL DEFAULT '',
  unit TEXT NOT NULL DEFAULT '',
  block TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pendente',
  photo_url TEXT DEFAULT '',
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  picked_up_at TIMESTAMPTZ,
  picked_up_by TEXT DEFAULT '',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view packages"
ON public.packages FOR SELECT TO authenticated USING (true);

CREATE POLICY "Porteiro and sindico can insert packages"
ON public.packages FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'porteiro') OR public.has_role(auth.uid(), 'sindico'));

CREATE POLICY "Porteiro and sindico can update packages"
ON public.packages FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'porteiro') OR public.has_role(auth.uid(), 'sindico'));

-- Visitors table
CREATE TABLE public.visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  document TEXT NOT NULL DEFAULT '',
  unit TEXT NOT NULL DEFAULT '',
  block TEXT NOT NULL DEFAULT '',
  resident_name TEXT NOT NULL DEFAULT '',
  entry_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  exit_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'dentro',
  vehicle TEXT DEFAULT '',
  registered_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view visitors"
ON public.visitors FOR SELECT TO authenticated USING (true);

CREATE POLICY "Porteiro and sindico can insert visitors"
ON public.visitors FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'porteiro') OR public.has_role(auth.uid(), 'sindico'));

CREATE POLICY "Porteiro and sindico can update visitors"
ON public.visitors FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'porteiro') OR public.has_role(auth.uid(), 'sindico'));

-- Reservations table
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space TEXT NOT NULL,
  resident_id UUID REFERENCES public.profiles(id),
  resident_name TEXT NOT NULL DEFAULT '',
  unit TEXT NOT NULL DEFAULT '',
  block TEXT NOT NULL DEFAULT '',
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view reservations"
ON public.reservations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert reservations"
ON public.reservations FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Sindico can update reservations"
ON public.reservations FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'sindico'));

-- Notices table
CREATE TABLE public.notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'aviso',
  date TEXT DEFAULT '',
  location TEXT DEFAULT '',
  is_new BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view notices"
ON public.notices FOR SELECT TO authenticated USING (true);

CREATE POLICY "Sindico can insert notices"
ON public.notices FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'sindico'));

CREATE POLICY "Sindico can update notices"
ON public.notices FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'sindico'));

CREATE POLICY "Sindico can delete notices"
ON public.notices FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'sindico'));

-- Occurrences table
CREATE TABLE public.occurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'outro',
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  resident_id UUID REFERENCES auth.users(id),
  resident_name TEXT NOT NULL DEFAULT '',
  unit TEXT NOT NULL DEFAULT '',
  block TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'aberta',
  photo_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.occurrences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view occurrences"
ON public.occurrences FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert occurrences"
ON public.occurrences FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Sindico can update occurrences"
ON public.occurrences FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'sindico'));

-- Occurrence timeline events
CREATE TABLE public.occurrence_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occurrence_id UUID REFERENCES public.occurrences(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  performed_by TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.occurrence_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view events"
ON public.occurrence_events FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert events"
ON public.occurrence_events FOR INSERT TO authenticated WITH CHECK (true);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'morador'));
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
