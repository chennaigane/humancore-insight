
-- Create enum types for better data integrity
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'employee');
CREATE TYPE activity_type AS ENUM ('APP', 'WEBSITE', 'IDLE', 'PAUSE');
CREATE TYPE productivity_level AS ENUM ('PRODUCTIVE', 'NEUTRAL', 'UNPRODUCTIVE');

-- Users table (extending existing profiles)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS team_id UUID,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Update existing role column to use enum (if not already)
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE user_role USING role::user_role;

-- Teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Work sessions table
CREATE TABLE public.work_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  total_active_minutes INTEGER DEFAULT 0,
  total_idle_minutes INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activity events table
CREATE TABLE public.activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.work_sessions(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  activity_type activity_type NOT NULL,
  app_name TEXT,
  process_name TEXT,
  url_domain TEXT,
  url_path TEXT,
  window_title TEXT,
  category_id UUID,
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Categories table for productivity classification
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  productivity productivity_level NOT NULL DEFAULT 'NEUTRAL',
  color TEXT DEFAULT '#6B7280',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Category rules for automatic classification
CREATE TABLE public.category_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('domain', 'process', 'app_name')),
  pattern TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Work schedules table
CREATE TABLE public.work_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  workdays INTEGER[] DEFAULT '{1,2,3,4,5}', -- Monday to Friday
  start_hour INTEGER DEFAULT 9,
  end_hour INTEGER DEFAULT 17,
  timezone TEXT DEFAULT 'UTC',
  auto_clock_in BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT check_user_or_team CHECK (
    (user_id IS NOT NULL AND team_id IS NULL) OR 
    (user_id IS NULL AND team_id IS NOT NULL)
  )
);

-- Add foreign key for team_id in profiles
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_team_id 
FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE SET NULL;

-- Add foreign key for category in activity_events
ALTER TABLE public.activity_events 
ADD CONSTRAINT fk_activity_events_category_id 
FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;

-- Enable RLS on all tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teams
CREATE POLICY "Users can view their team" ON public.teams
  FOR SELECT USING (
    id IN (SELECT team_id FROM public.profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

CREATE POLICY "Admins can manage teams" ON public.teams
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for work_sessions
CREATE POLICY "Users can view own sessions" ON public.work_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Managers can view team sessions" ON public.work_sessions
  FOR SELECT USING (
    user_id = auth.uid() OR
    (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')) AND
     user_id IN (SELECT id FROM public.profiles WHERE team_id IN (
       SELECT team_id FROM public.profiles WHERE id = auth.uid()
     )))
  );

CREATE POLICY "Users can insert own sessions" ON public.work_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sessions" ON public.work_sessions
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for activity_events
CREATE POLICY "Users can view own activity events" ON public.activity_events
  FOR SELECT USING (
    session_id IN (SELECT id FROM public.work_sessions WHERE user_id = auth.uid())
  );

CREATE POLICY "Managers can view team activity events" ON public.activity_events
  FOR SELECT USING (
    session_id IN (SELECT id FROM public.work_sessions WHERE user_id = auth.uid()) OR
    (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')) AND
     session_id IN (SELECT ws.id FROM public.work_sessions ws 
                    JOIN public.profiles p ON ws.user_id = p.id 
                    WHERE p.team_id IN (SELECT team_id FROM public.profiles WHERE id = auth.uid())))
  );

CREATE POLICY "Users can insert own activity events" ON public.activity_events
  FOR INSERT WITH CHECK (
    session_id IN (SELECT id FROM public.work_sessions WHERE user_id = auth.uid())
  );

-- RLS Policies for categories (everyone can read, admins can manage)
CREATE POLICY "Everyone can view categories" ON public.categories
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for category_rules
CREATE POLICY "Everyone can view category rules" ON public.category_rules
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage category rules" ON public.category_rules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for work_schedules
CREATE POLICY "Users can view relevant schedules" ON public.work_schedules
  FOR SELECT USING (
    user_id = auth.uid() OR
    team_id IN (SELECT team_id FROM public.profiles WHERE id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

CREATE POLICY "Managers can manage schedules" ON public.work_schedules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

-- Insert default categories
INSERT INTO public.categories (name, productivity, color, description) VALUES
('Development', 'PRODUCTIVE', '#10B981', 'Software development tools and IDEs'),
('Office Work', 'PRODUCTIVE', '#3B82F6', 'Office applications and productivity tools'),
('Communication', 'NEUTRAL', '#F59E0B', 'Email, chat, and communication tools'),
('Research', 'NEUTRAL', '#8B5CF6', 'Research and learning activities'),
('Social Media', 'UNPRODUCTIVE', '#EF4444', 'Social networking and entertainment'),
('Entertainment', 'UNPRODUCTIVE', '#F97316', 'Games, videos, and entertainment'),
('System', 'NEUTRAL', '#6B7280', 'System and utility applications');

-- Insert default category rules
INSERT INTO public.category_rules (category_id, rule_type, pattern) 
SELECT c.id, 'process', pattern
FROM public.categories c
CROSS JOIN (VALUES 
  ('Development', 'code.exe'),
  ('Development', 'devenv.exe'),
  ('Development', 'idea64.exe'),
  ('Development', 'pycharm64.exe'),
  ('Office Work', 'excel.exe'),
  ('Office Work', 'winword.exe'),
  ('Office Work', 'powerpnt.exe'),
  ('Communication', 'outlook.exe'),
  ('Communication', 'teams.exe'),
  ('Communication', 'slack.exe'),
  ('Social Media', 'facebook.com'),
  ('Social Media', 'twitter.com'),
  ('Social Media', 'instagram.com'),
  ('Entertainment', 'youtube.com'),
  ('Entertainment', 'netflix.com'),
  ('Entertainment', 'twitch.tv')
) AS rules(category_name, pattern)
WHERE c.name = rules.category_name;

-- Create indexes for better performance
CREATE INDEX idx_work_sessions_user_id ON public.work_sessions(user_id);
CREATE INDEX idx_work_sessions_start_time ON public.work_sessions(start_time);
CREATE INDEX idx_activity_events_session_id ON public.activity_events(session_id);
CREATE INDEX idx_activity_events_start_time ON public.activity_events(start_time);
CREATE INDEX idx_activity_events_activity_type ON public.activity_events(activity_type);
CREATE INDEX idx_category_rules_pattern ON public.category_rules(pattern);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_sessions_updated_at BEFORE UPDATE ON public.work_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_schedules_updated_at BEFORE UPDATE ON public.work_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
