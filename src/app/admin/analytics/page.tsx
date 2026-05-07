'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AnalyticsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [bootcamps, setBootcamps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [regRes, bootRes] = await Promise.all([
          supabase.from('registrations').select('*, bootcamps(price, title)'),
          supabase.from('bootcamps').select('*')
        ]);

        if (regRes.error) throw regRes.error;
        if (bootRes.error) throw bootRes.error;

        setRegistrations(regRes.data || []);
        setBootcamps(bootRes.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-gray-500 font-mono tracking-widest uppercase">Loading Analytics...</div>;
  }

  if (error) {
    return <div className="p-6 border border-red-900 bg-red-950/20 text-red-500 font-mono text-sm uppercase">{error}</div>;
  }

  // Calculate Metrics
  const totalRegistrations = registrations.length;
  
  const revenueRegistrations = registrations.filter(r => r.payment_status === 'paid' || r.payment_status === 'verified');
  const totalRevenue = revenueRegistrations.reduce((acc, curr) => acc + (curr.bootcamps?.price || 0), 0);

  const collegeRegistrations = registrations.filter(r => r.student_type === 'college').length;

  const registrationsByCourse = bootcamps.map(course => {
    return {
      title: course.title,
      count: registrations.filter(r => r.bootcamp_id === course.id).length
    };
  }).sort((a, b) => b.count - a.count);

  return (
    <div className="p-6 md:p-12 max-w-[1600px] mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2">Analytics</h1>
        <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">[ SYSTEM METRICS ]</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-[#0a0a0a] border border-[#333] p-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Total Registrations</h3>
          <p className="text-5xl font-black text-white">{totalRegistrations}</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#333] p-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Total Revenue</h3>
          <p className="text-5xl font-black text-green-500">₹{totalRevenue.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-600 font-mono mt-2 uppercase tracking-wider">From Paid/Verified Only</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#333] p-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Total Students</h3>
          <p className="text-5xl font-black text-white">{collegeRegistrations}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-[#0a0a0a] border border-[#333] p-8">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-6 border-b border-[#222] pb-4">Registrations by Course</h3>
          <div className="space-y-6">
            {registrationsByCourse.map(course => (
              <div key={course.title}>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-gray-300 uppercase tracking-wider">{course.title}</span>
                  <span className="text-white font-mono">{course.count}</span>
                </div>
                <div className="h-2 w-full bg-[#111] overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-1000" 
                    style={{ width: totalRegistrations ? `${(course.count / totalRegistrations) * 100}%` : '0%' }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
