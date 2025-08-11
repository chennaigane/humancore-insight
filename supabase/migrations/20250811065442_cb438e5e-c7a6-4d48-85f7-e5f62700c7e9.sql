
-- Create a profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create a team_members table to store team member data
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('active', 'offline', 'break')),
  activity TEXT NOT NULL DEFAULT 'offline',
  productivity INTEGER NOT NULL DEFAULT 0 CHECK (productivity >= 0 AND productivity <= 100),
  active_time TEXT NOT NULL DEFAULT '0h 0m',
  productive_time TEXT NOT NULL DEFAULT '0h 0m',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Team members policies
CREATE POLICY "Authenticated users can view team members" 
  ON public.team_members 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert team members" 
  ON public.team_members 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update team members" 
  ON public.team_members 
  FOR UPDATE 
  TO authenticated
  USING (true);

-- Create trigger to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(new.raw_user_meta_data ->> 'role', 'user')
  );
  RETURN new;
END;
$$;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert some initial team members data
INSERT INTO public.team_members (name, email, status, activity, productivity, active_time, productive_time, role) VALUES
('Kiran', 'kiran@company.com', 'active', 'coding', 87, '7h 45m', '6h 54m', 'admin'),
('Ganesh', 'ganesh@company.com', 'active', 'meeting', 81, '8h 30m', '6h 54m', 'user'),
('Raghavendra', 'raghavendra@company.com', 'offline', 'break', 91, '6h 45m', '6h 10m', 'user'),
('Dhanashvil', 'dhanashvil@company.com', 'active', 'documentation', 90, '7h 43m', '6h 59m', 'user'),
('Jahaeshwaran', 'jahaeshwaran@company.com', 'active', 'testing', 75, '5h 45m', '4h 19m', 'user'),
('Janardhnavari', 'janardhnavari@company.com', 'offline', 'offline', 65, '3h 46m', '2h 30m', 'user');
