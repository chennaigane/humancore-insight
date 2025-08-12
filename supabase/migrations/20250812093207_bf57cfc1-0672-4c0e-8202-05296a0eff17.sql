
-- Create time tracking table for automatic hourly monitoring
CREATE TABLE public.time_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  hour_slot INTEGER NOT NULL CHECK (hour_slot >= 0 AND hour_slot <= 23),
  productive_minutes INTEGER NOT NULL DEFAULT 0,
  unproductive_minutes INTEGER NOT NULL DEFAULT 0,
  total_minutes INTEGER NOT NULL DEFAULT 0,
  activity_type TEXT NOT NULL DEFAULT 'offline',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date, hour_slot)
);

-- Create daily summary table for end-of-day reports
CREATE TABLE public.daily_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_productive_hours DECIMAL(4,2) NOT NULL DEFAULT 0,
  total_unproductive_hours DECIMAL(4,2) NOT NULL DEFAULT 0,
  total_active_hours DECIMAL(4,2) NOT NULL DEFAULT 0,
  productivity_percentage INTEGER NOT NULL DEFAULT 0,
  report_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS on both tables
ALTER TABLE public.time_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for time_tracking
CREATE POLICY "Users can view their own time tracking" 
  ON public.time_tracking 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own time tracking" 
  ON public.time_tracking 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time tracking" 
  ON public.time_tracking 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS policies for daily_reports
CREATE POLICY "Users can view their own daily reports" 
  ON public.daily_reports 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all daily reports" 
  ON public.daily_reports 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to update hourly time tracking
CREATE OR REPLACE FUNCTION public.update_hourly_tracking(
  p_user_id UUID,
  p_productive_mins INTEGER DEFAULT 0,
  p_unproductive_mins INTEGER DEFAULT 0,
  p_activity_type TEXT DEFAULT 'offline'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_hour INTEGER;
  current_date DATE;
BEGIN
  current_hour := EXTRACT(HOUR FROM NOW());
  current_date := CURRENT_DATE;
  
  INSERT INTO public.time_tracking (
    user_id, date, hour_slot, productive_minutes, 
    unproductive_minutes, total_minutes, activity_type
  )
  VALUES (
    p_user_id, current_date, current_hour, 
    p_productive_mins, p_unproductive_mins,
    p_productive_mins + p_unproductive_mins, p_activity_type
  )
  ON CONFLICT (user_id, date, hour_slot)
  DO UPDATE SET
    productive_minutes = time_tracking.productive_minutes + p_productive_mins,
    unproductive_minutes = time_tracking.unproductive_minutes + p_unproductive_mins,
    total_minutes = time_tracking.total_minutes + p_productive_mins + p_unproductive_mins,
    activity_type = p_activity_type,
    updated_at = NOW();
END;
$$;

-- Function to generate daily summary
CREATE OR REPLACE FUNCTION public.generate_daily_summary(p_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.daily_reports (
    user_id, date, total_productive_hours, total_unproductive_hours, 
    total_active_hours, productivity_percentage
  )
  SELECT 
    user_id,
    date,
    ROUND(SUM(productive_minutes)::DECIMAL / 60, 2) as total_productive_hours,
    ROUND(SUM(unproductive_minutes)::DECIMAL / 60, 2) as total_unproductive_hours,
    ROUND(SUM(total_minutes)::DECIMAL / 60, 2) as total_active_hours,
    CASE 
      WHEN SUM(total_minutes) > 0 
      THEN ROUND((SUM(productive_minutes)::DECIMAL / SUM(total_minutes) * 100))
      ELSE 0 
    END as productivity_percentage
  FROM public.time_tracking
  WHERE date = p_date
  GROUP BY user_id, date
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    total_productive_hours = EXCLUDED.total_productive_hours,
    total_unproductive_hours = EXCLUDED.total_unproductive_hours,
    total_active_hours = EXCLUDED.total_active_hours,
    productivity_percentage = EXCLUDED.productivity_percentage,
    updated_at = NOW();
END;
$$;
