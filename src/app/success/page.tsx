import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default async function SuccessPage(props: { searchParams: Promise<{ bootcampId?: string }> }) {
  const searchParams = await props.searchParams;
  const bootcampId = searchParams.bootcampId;

  let title = 'Registration Submitted';
  
  if (bootcampId) {
    const { data: bootcamp } = await supabase
      .from('bootcamps')
      .select('title')
      .eq('id', bootcampId)
      .single();
      
    if (bootcamp) {
      title = `Registration for ${bootcamp.title} Submitted!`;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-burgundy/10 to-transparent pointer-events-none"></div>
      
      <div className="max-w-2xl text-center relative z-10 border border-[#333] bg-[#0a0a0a] p-12">
        <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-accent">
          <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter mb-4 text-white">
          {title}
        </h1>
        
        <p className="text-gray-400 mb-8 font-mono text-sm leading-relaxed">
          Your registration details and payment proof have been received. Our team will verify your transaction and you will receive a confirmation email shortly.
        </p>
        
        <Link 
          href="/"
          className="inline-block px-8 py-3 bg-white text-black hover:bg-accent hover:text-black transition-colors uppercase text-sm font-bold tracking-widest"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
