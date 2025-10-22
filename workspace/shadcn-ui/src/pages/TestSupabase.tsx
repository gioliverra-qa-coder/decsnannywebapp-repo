// src/pages/TestSupabase.tsx
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function TestSupabase() {
  const [message, setMessage] = useState('Connecting to Supabase...');

  useEffect(() => {
    async function testConnection() {
      try {
        // Example: fetch a simple query from a table called 'nannies'
        const { data, error } = await supabase.from('nannies').select('*').limit(1);

        if (error) {
          setMessage(`Error: ${error.message}`);
        } else if (data) {
          setMessage(`Success! Retrieved ${data.length} record(s)`);
        }
      } catch (err: any) {
        setMessage(`Unexpected error: ${err.message}`);
      }
    }

    testConnection();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <h1 className="text-xl font-semibold text-gray-800">{message}</h1>
    </div>
  );
}
