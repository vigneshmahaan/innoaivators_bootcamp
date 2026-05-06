import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export type Bootcamp = {
  id: string;
  title: string;
  description: string;
  price: number;
};

export const useBootcamp = (bootcampId?: string) => {
  const [bootcamp, setBootcamp] = useState<Bootcamp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBootcamp = async () => {
      try {
        let data, error;
        
        if (bootcampId) {
          const res = await supabase.from('bootcamps').select('*').eq('id', bootcampId).maybeSingle();
          data = res.data;
          error = res.error;
        } else {
          // Fallback to fetch the first bootcamp if none specified
          const res = await supabase.from('bootcamps').select('*').limit(1).maybeSingle();
          data = res.data;
          error = res.error;
        }

        if (error) throw error;
        setBootcamp(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch bootcamp details.');
      } finally {
        setLoading(false);
      }
    };

    fetchBootcamp();
  }, [bootcampId]);

  return { bootcamp, loading, error };
};
