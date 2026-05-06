import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Bootcamp } from './useBootcamp';

export const useBootcamps = () => {
  const [bootcamps, setBootcamps] = useState<Bootcamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBootcamps = async () => {
      try {
        const { data, error } = await supabase.from('bootcamps').select('*').order('created_at', { ascending: true });

        if (error) throw error;
        setBootcamps(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch bootcamps.');
      } finally {
        setLoading(false);
      }
    };

    fetchBootcamps();
  }, []);

  return { bootcamps, loading, error };
};
