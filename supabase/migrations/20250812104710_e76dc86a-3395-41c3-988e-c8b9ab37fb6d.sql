
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can view all team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can view their own team member record" ON public.team_members;
DROP POLICY IF EXISTS "Only admins can insert team members" ON public.team_members;
DROP POLICY IF EXISTS "Only admins can update team members" ON public.team_members;

-- Create a security definer function to get user role (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Policy for admins to view all team members
CREATE POLICY "Admins can view all team members" 
  ON public.team_members 
  FOR SELECT 
  USING (public.get_current_user_role() = 'admin');

-- Policy for users to view their own team member record
CREATE POLICY "Users can view their own team member record" 
  ON public.team_members 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email = team_members.email
    )
  );

-- Policy for admins to insert team members
CREATE POLICY "Admins can insert team members" 
  ON public.team_members 
  FOR INSERT 
  WITH CHECK (
    public.get_current_user_role() = 'admin' 
    AND auth.uid() = created_by
  );

-- Policy for admins to update all team members
CREATE POLICY "Admins can update all team members" 
  ON public.team_members 
  FOR UPDATE 
  USING (public.get_current_user_role() = 'admin');

-- Policy for users to update their own team member record
CREATE POLICY "Users can update their own team member record" 
  ON public.team_members 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email = team_members.email
    )
  );

-- Policy for admins to delete team members
CREATE POLICY "Admins can delete team members" 
  ON public.team_members 
  FOR DELETE 
  USING (public.get_current_user_role() = 'admin');
