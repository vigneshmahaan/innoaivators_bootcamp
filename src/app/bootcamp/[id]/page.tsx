import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function BootcampDetails(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { data: bootcamp, error } = await supabase
    .from('bootcamps')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !bootcamp) {
    notFound();
  }

  return (
    <div className="min-h-screen p-8 md:p-24 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-burgundy/10 to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-navy/20 to-transparent pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <Link href="/" className="text-gray-400 hover:text-white mb-8 inline-block uppercase text-xs tracking-widest font-mono">
          ← Back to Bootcamps
        </Link>

        <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
          {bootcamp.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 mb-12">
          <div className="flex items-center gap-4">
            <span className="bg-white text-black px-3 py-1 font-mono text-sm font-bold">Premium</span>
            <span className="text-accent font-mono text-xl">₹{bootcamp.price.toLocaleString('en-IN')}</span>
          </div>
          {bootcamp.duration_days && (
            <div className="flex items-center gap-2 text-gray-400 font-mono text-sm uppercase tracking-widest">
              <span className="w-1 h-1 bg-accent rounded-full"></span>
              {bootcamp.duration_days} Days Intensive
            </div>
          )}
        </div>

        <div className="bg-[#0a0a0a] border border-[#333] p-8 md:p-12 mb-8 relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-burgundy/5 to-navy/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h2 className="text-xl uppercase tracking-wider font-bold text-gray-300">Overview</h2>
          </div>
          <p className="text-lg text-gray-400 leading-relaxed relative z-10 text-justify">
            {bootcamp.description.replace(new RegExp(`${bootcamp.duration_days}\\s*Days`, 'gi'), '').trim()}
          </p>
        </div>



        {bootcamp.final_task && (
          <div className="bg-[#111] border border-[#444] p-8 md:p-12 mb-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
            <h2 className="text-2xl uppercase tracking-widest mb-4 font-black text-white">The Internship Challenge</h2>
            <div className="h-px w-16 bg-gray-500 mb-6"></div>
            <p className="text-xl text-gray-300 leading-relaxed relative z-10 italic">
              "{bootcamp.final_task}"
            </p>
          </div>
        )}

        <div className="text-center">
          <Link
            href={`/register?bootcampId=${bootcamp.id}`}
            className="inline-block px-12 py-4 bg-white text-black hover:bg-accent hover:text-black transition-all duration-300 uppercase text-lg font-bold tracking-widest relative overflow-hidden group"
          >
            <span className="relative z-10">Register Now</span>
            <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </Link>
        </div>
      </div>
    </div>
  );
}
