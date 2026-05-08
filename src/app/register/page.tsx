import { supabase } from '@/lib/supabase';
import { RegistrationForm } from '@/components/registration-form';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function RegisterPage(props: { searchParams: Promise<{ bootcampId?: string }> }) {
  const searchParams = await props.searchParams;
  
  if (!searchParams.bootcampId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold uppercase mb-4 text-white">No Bootcamp Selected</h1>
          <Link href="/" className="text-accent hover:underline font-mono">Return to Bootcamps</Link>
        </div>
      </div>
    );
  }

  const { data: bootcamp, error } = await supabase
    .from('bootcamps')
    .select('*')
    .eq('id', searchParams.bootcampId)
    .single();

  if (error || !bootcamp) {
    notFound();
  }

  return (
    <div className="min-h-screen p-4 md:p-24 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-navy/10 to-transparent pointer-events-none"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="mb-12">
          <Link href={`/bootcamp/${bootcamp.id}`} className="text-gray-400 hover:text-white mb-4 inline-block uppercase text-xs tracking-widest font-mono">
            ← Back to Details
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-2 text-white">
            Registration
          </h1>
          <p className="text-xl text-gray-400 font-mono">
            {bootcamp.title}
          </p>
        </div>

        <RegistrationForm bootcampId={bootcamp.id} price={bootcamp.price} />
      </div>
    </div>
  );
}
