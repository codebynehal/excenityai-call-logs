// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://qnztqyguinzaiicmzspi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuenRxeWd1aW56YWlpY216c3BpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MDcwNDgsImV4cCI6MjA2MDM4MzA0OH0.mgjiwIer_NLLms1yIHCQyuswYeNwWtyNt6_nACZZnK0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);