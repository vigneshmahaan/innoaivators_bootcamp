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
    <div className="min-h-screen p-6 md:p-24 relative overflow-hidden bg-black">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-white/5 to-transparent pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <Link href="/" className="text-gray-500 hover:text-white mb-12 inline-block uppercase text-[10px] tracking-[0.3em] font-mono transition-colors">
          ← Back to Catalog
        </Link>

        <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-6 text-white leading-none">
          {bootcamp.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 mb-12">
          <div className="flex items-center gap-4">
            <span className="bg-white text-black px-3 py-1 font-mono text-[10px] font-black uppercase tracking-widest">Premium</span>
            <span className="text-white font-mono text-xl font-bold italic tracking-tighter">₹{bootcamp.price.toLocaleString('en-IN')}</span>
          </div>
          {bootcamp.duration_days && (
            <div className="flex items-center gap-2 text-gray-500 font-mono text-[10px] uppercase tracking-[0.2em] font-bold">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              {bootcamp.duration_days} Days Intensive
            </div>
          )}
        </div>

        <div className="bg-[#050505] border border-white/10 p-8 md:p-16 mb-8 relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="mb-6 relative z-10">
            <h2 className="text-xs uppercase tracking-[0.4em] font-black text-gray-500 mb-2">01. Overview</h2>
            <div className="h-px w-12 bg-white/20"></div>
          </div>
          <p className="text-base md:text-lg text-gray-400 leading-relaxed relative z-10 text-justify font-medium">
            {bootcamp.description.replace(new RegExp(`${bootcamp.duration_days}\\s*Days`, 'gi'), '').trim()}
          </p>
        </div>

        {bootcamp.final_task && (
          <div className="bg-white p-8 md:p-16 mb-12 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-xs uppercase tracking-[0.4em] font-black text-gray-500 mb-6">02. The Challenge</h2>
              <p className="text-xl md:text-3xl text-black font-black uppercase tracking-tighter leading-tight italic">
                "{bootcamp.final_task}"
              </p>
            </div>
          </div>
        )}

        <div className="text-center pt-8">
          <Link
            href={`/register?bootcampId=${bootcamp.id}`}
            className="inline-block w-full md:w-auto px-16 py-5 bg-white text-black hover:bg-gray-200 transition-all duration-500 uppercase text-xs font-black tracking-[0.3em] shadow-2xl shadow-white/10"
          >
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
}
