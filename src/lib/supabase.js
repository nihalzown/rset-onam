import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database schema for reference:
/*
CREATE TABLE registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  college_id VARCHAR(20) UNIQUE NOT NULL,
  house VARCHAR(20) NOT NULL CHECK (house IN ('SPARTANS', 'MUGHALS', 'VIKINGS', 'RAJPUTS', 'ARYANS')),
  class VARCHAR(20) NOT NULL CHECK (class IN ('AEI', 'AIDS', 'CIVIL', 'CSBS', 'CS ALPHA', 'CS BETA', 'CS GAMMA', 'CS DELTA', 'EEE', 'EC ALPHA', 'EC BETA', 'EC GAMMA', 'IT', 'MECH ALPHA', 'MECH BETA')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX idx_registrations_house ON registrations(house);
CREATE INDEX idx_registrations_college_id ON registrations(college_id);
*/
