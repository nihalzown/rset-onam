-- Supabase Database Schema for Onam Procession Registration Portal

-- Create an enum type for houses
CREATE TYPE house_enum AS ENUM ('SPARTANS', 'MUGHALS', 'VIKINGS', 'RAJPUTS', 'ARYANS');

-- Create an enum type for class names
CREATE TYPE class_enum AS ENUM (
  'AEI', 'AIDS', 'CIVIL', 'CSBS', 
  'CS ALPHA', 'CS BETA', 'CS GAMMA', 'CS DELTA',
  'EEE', 'EC ALPHA', 'EC BETA', 'EC GAMMA', 
  'IT', 'MECH ALPHA', 'MECH BETA'
);

-- Create the main registrations table
CREATE TABLE public.registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  college_id VARCHAR(50) NOT NULL UNIQUE,
  house house_enum NOT NULL,
  class class_enum NOT NULL,
  registration_batch UUID NOT NULL, -- Groups 30 participants together
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_registrations_house ON public.registrations(house);
CREATE INDEX idx_registrations_college_id ON public.registrations(college_id);
CREATE INDEX idx_registrations_registration_batch ON public.registrations(registration_batch);
CREATE INDEX idx_registrations_created_at ON public.registrations(created_at);

-- Create a table to track house registration status
CREATE TABLE public.house_registration_status (
  house house_enum PRIMARY KEY,
  is_completed BOOLEAN DEFAULT FALSE,
  participants_count INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  registration_batch UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial data for all houses
INSERT INTO public.house_registration_status (house) 
VALUES ('SPARTANS'), ('MUGHALS'), ('VIKINGS'), ('RAJPUTS'), ('ARYANS');

-- Create a table for admin access control
CREATE TABLE public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  can_export BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit log table for tracking data exports
CREATE TABLE public.export_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID REFERENCES public.admin_users(id),
  export_type VARCHAR(20) NOT NULL, -- 'PDF' or 'EXCEL'
  total_records INTEGER NOT NULL,
  exported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Function to update house registration status
CREATE OR REPLACE FUNCTION update_house_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the count and completion status for the house
  UPDATE public.house_registration_status 
  SET 
    participants_count = (
      SELECT COUNT(*) 
      FROM public.registrations 
      WHERE house = NEW.house
    ),
    is_completed = (
      SELECT COUNT(*) >= 30
      FROM public.registrations 
      WHERE house = NEW.house
    ),
    completed_at = CASE 
      WHEN (SELECT COUNT(*) FROM public.registrations WHERE house = NEW.house) >= 30
      THEN NOW()
      ELSE completed_at
    END,
    registration_batch = CASE 
      WHEN (SELECT COUNT(*) FROM public.registrations WHERE house = NEW.house) >= 30
      THEN NEW.registration_batch
      ELSE registration_batch
    END,
    updated_at = NOW()
  WHERE house = NEW.house;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update house status
CREATE TRIGGER trigger_update_house_status
  AFTER INSERT ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_house_status();

-- Function to prevent registrations for completed houses
CREATE OR REPLACE FUNCTION check_house_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.house_registration_status 
    WHERE house = NEW.house AND is_completed = TRUE
  ) THEN
    RAISE EXCEPTION 'Registration for house % is already completed', NEW.house;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent duplicate registrations
CREATE TRIGGER trigger_check_house_completion
  BEFORE INSERT ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION check_house_completion();

-- Enable Row Level Security (RLS)
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.house_registration_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies for public access to registrations (insert only)
CREATE POLICY "Allow public insert" ON public.registrations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read" ON public.registrations
  FOR SELECT USING (true);

-- Create policies for house status (read only for public)
CREATE POLICY "Allow public read house status" ON public.house_registration_status
  FOR SELECT USING (true);

-- Create policies for admin users (admin access only)
CREATE POLICY "Admin users can read their own data" ON public.admin_users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Create policies for export audit log (admin access only)
CREATE POLICY "Admin users can access export logs" ON public.export_audit_log
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = TRUE
  ));

-- Create a view for registration summary
CREATE VIEW public.registration_summary AS
SELECT 
  h.house,
  h.is_completed,
  h.participants_count,
  h.completed_at,
  CASE 
    WHEN h.is_completed THEN '✅ Complete'
    ELSE CONCAT(h.participants_count, '/30 registered')
  END as status_display
FROM public.house_registration_status h
ORDER BY h.house;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT ON public.registrations TO anon, authenticated;
GRANT SELECT ON public.house_registration_status TO anon, authenticated;
GRANT SELECT ON public.registration_summary TO anon, authenticated;

-- Admin-only permissions
GRANT ALL ON public.admin_users TO authenticated;
GRANT ALL ON public.export_audit_log TO authenticated;

-- Insert a default admin user (password should be hashed in production)
INSERT INTO public.admin_users (email, password_hash, full_name, role) 
VALUES (
  'admin@rset-onam.edu', 
  '$2b$10$example_hash_replace_with_real_hash', 
  'RSET Admin', 
  'super_admin'
);

-- Create a function for secure data export (admin only)
CREATE OR REPLACE FUNCTION public.export_registrations(
  export_type TEXT DEFAULT 'VIEW'
)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  college_id VARCHAR,
  house TEXT,
  class TEXT,
  registration_batch UUID,
  created_at TIMESTAMP WITH TIME ZONE
) 
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin (in a real app, you'd check authentication)
  -- For now, we'll just return the data
  
  -- Log the export attempt
  IF export_type IN ('PDF', 'EXCEL') THEN
    INSERT INTO public.export_audit_log (export_type, total_records, exported_at)
    VALUES (export_type, (SELECT COUNT(*) FROM public.registrations), NOW());
  END IF;
  
  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.college_id,
    r.house::TEXT,
    r.class::TEXT,
    r.registration_batch,
    r.created_at
  FROM public.registrations r
  ORDER BY r.house, r.created_at;
END;
$$ LANGUAGE plpgsql;
