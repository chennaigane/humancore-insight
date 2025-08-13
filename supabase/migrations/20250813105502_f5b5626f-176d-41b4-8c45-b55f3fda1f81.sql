
-- Clear existing team members and profiles
DELETE FROM public.team_members;
DELETE FROM public.profiles;

-- Create admin account profile
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at) 
VALUES (
  'a1349a6d-91cf-4a96-a067-ba008626b8f8'::uuid,
  'admin@metrx.com',
  'System Administrator',
  'admin',
  now(),
  now()
);

-- Create user account profile  
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
VALUES (
  'b2450b7e-82df-5ba7-b178-ca109737c9c9'::uuid,
  'user@metrx.com', 
  'Standard User',
  'user',
  now(),
  now()
);

-- Create corresponding team member records
INSERT INTO public.team_members (name, email, role, status, activity, productivity, active_time, productive_time, created_by, created_at, updated_at)
VALUES 
(
  'System Administrator',
  'admin@metrx.com',
  'admin',
  'offline',
  'offline', 
  0,
  '0h 0m',
  '0h 0m',
  'a1349a6d-91cf-4a96-a067-ba008626b8f8'::uuid,
  now(),
  now()
),
(
  'Standard User',
  'user@metrx.com',
  'user', 
  'offline',
  'offline',
  0,
  '0h 0m', 
  '0h 0m',
  'a1349a6d-91cf-4a96-a067-ba008626b8f8'::uuid,
  now(),
  now()
);
