import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { deleteBootcamp } from './actions';

export const revalidate = 0; // Disable caching for admin dashboard

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  if (!cookieStore.has('admin_auth')) {
    redirect('/admin/login');
  }

  const { data: bootcamps, error } = await supabase
    .from('bootcamps')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2">Bootcamps</h1>
          <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">[ MANAGE CATALOG ]</p>
        </div>
        <Link 
          href="/admin/new" 
          className="inline-flex items-center justify-center px-6 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors"
        >
          + Add New Course
        </Link>
      </div>

      {error ? (
        <div className="p-6 border border-red-900 bg-red-950/20">
          <p className="text-red-400 font-mono uppercase text-sm">Error loading bootcamps: {error.message}</p>
        </div>
      ) : !bootcamps || bootcamps.length === 0 ? (
        <div className="p-12 border border-[#333] bg-[#111] text-center">
          <h3 className="text-2xl font-bold uppercase tracking-widest text-gray-500">NO COURSES FOUND</h3>
        </div>
      ) : (
        <div className="grid gap-6">
          {bootcamps.map((course) => (
            <div key={course.id} className="bg-[#0a0a0a] border border-[#333] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white transition-colors group">
              <div className="flex-1">
                <h3 className="text-2xl font-bold uppercase tracking-tight mb-2 group-hover:text-white transition-colors">{course.title}</h3>
                <p className="text-gray-400 text-sm line-clamp-2 mb-4 max-w-3xl">{course.description}</p>
                <div className="flex items-center gap-4 font-mono text-xs text-gray-500 uppercase tracking-widest">
                  <span>ID: {course.id.split('-')[0]}...</span>
                  <span>|</span>
                  <span className="text-white">₹{course.price.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-4">
                <form action={async () => {
                  'use server';
                  await deleteBootcamp(course.id);
                  redirect('/admin'); // Force re-render
                }}>
                  <button type="submit" className="px-4 py-2 border border-red-900 text-red-500 hover:bg-red-900 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
