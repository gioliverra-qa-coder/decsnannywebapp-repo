import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project values
const supabaseUrl = 'https://zmkszzzrbussqwyhdvxj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpta3N6enpyYnVzc3F3eWhkdnhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NDMyOTIsImV4cCI6MjA3NjIxOTI5Mn0.v48C1oWdtdXo2JqTNEssHcmAqXFWP9FwHREIaKZQgxA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);