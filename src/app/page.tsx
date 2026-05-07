import { supabase } from '@/lib/supabase';
import { BootcampCard } from '@/components/bootcamp-card';
import { Navbar } from '@/components/layout/Navbar';

export const revalidate = 3600;

export default async function Home() {
  const { data: bootcamps, error } = await supabase
    .from('bootcamps')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-12 px-6 overflow-hidden flex flex-col items-center justify-center text-center min-h-[70vh] md:min-h-[calc(100vh-6rem)]">
          <div className="max-w-5xl mx-auto relative z-10 space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9]">
              INNOVATE.<br />CREATE.<br />
              <span className="text-gray-500">ELEVATE.</span>
            </h1>
            <p className="text-xs md:text-sm text-gray-500 max-w-lg mx-auto font-black uppercase tracking-[0.3em] leading-relaxed">
              Intensive, industry-aligned bootcamps.<br/>No fluff. Just raw skills.
            </p>
            <div className="pt-8">
              <a href="#bootcamps" className="inline-flex items-center justify-center px-12 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-black bg-white rounded-full hover:bg-gray-200 transition-all shadow-2xl shadow-white/10">
                Explore Programs
              </a>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-24 md:py-40 px-6 border-t border-white/5 bg-[#030303]">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-20 lg:gap-32">
              <div>
                <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-10 leading-none">
                  WE BUILD<br/><span className="text-gray-500">CAREERS.</span>
                </h2>
                <p className="text-gray-400 text-lg md:text-xl leading-relaxed font-medium text-justify">
                  At InnoAivators, we bridge the gap between academic learning and industry demands. We don't just build software; we build careers through intensive training programs that equip you with practical experience.
                </p>
              </div>
              <div className="space-y-12 border-t lg:border-t-0 lg:border-l border-white/10 pt-12 lg:pt-0 lg:pl-20">
                {[
                  { id: '01', title: 'AI AUTOMATION' },
                  { id: '02', title: 'WEB & APP DEV' },
                  { id: '03', title: 'IOT SOLUTIONS' }
                ].map(item => (
                  <div key={item.id} className="group cursor-default">
                    <span className="font-mono text-[10px] text-gray-600 block mb-2 tracking-[0.3em]">[{item.id}]</span>
                    <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter group-hover:text-gray-400 transition-colors">{item.title}</h3>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Internship Highlight */}
        <section className="py-24 md:py-40 px-6 border-t border-white/5 bg-black">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="order-2 lg:order-1">
                <p className="text-lg md:text-2xl text-gray-400 leading-relaxed font-medium mb-12 text-justify">
                  We believe in learning by doing. During our bootcamps, you will be assigned a comprehensive final task. Participants who complete this task efficiently will be directly offered an internship.
                </p>
                <a href="#bootcamps" className="inline-flex items-center justify-center w-full md:w-auto px-12 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-white border border-white/20 hover:bg-white hover:text-black transition-all">
                  Accept Challenge
                </a>
              </div>
              <div className="order-1 lg:order-2 lg:text-right">
                <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.8]">
                  THE<br /><span className="text-gray-600">INTERNSHIP</span><br />CHALLENGE
                </h2>
              </div>
            </div>
          </div>
        </section>

        {/* Bootcamps Section */}
        <section id="bootcamps" className="py-24 md:py-40 px-6 border-t border-white/5 bg-[#030303]">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20 text-center md:text-left">
              <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-4">OUR COURSES</h2>
              <p className="text-gray-600 font-mono text-[10px] uppercase tracking-[0.4em]">[ SELECT A PROGRAM ]</p>
            </div>

            {error ? (
              <div className="p-8 border border-red-900 bg-red-950/20">
                <p className="text-red-400 font-mono uppercase text-sm">Error: {error.message}</p>
              </div>
            ) : !bootcamps || bootcamps.length === 0 ? (
              <div className="p-12 border border-[#333] bg-[#0a0a0a]">
                <h3 className="text-2xl font-bold uppercase tracking-widest text-gray-500">NO COURSES AVAILABLE</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {bootcamps.map((course) => (
                  <BootcampCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    price={course.price}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Massive Footer */}
      <footer className="py-24 px-6 border-t border-[#333] text-center bg-black">
        <div className="max-w-7xl mx-auto overflow-hidden">
          <p className="text-gray-500 font-mono text-sm uppercase tracking-widest mb-12">[ GET IN TOUCH ]</p>
          <a href="mailto:rockyvignesh312@gmail.com" className="block text-2xl md:text-4xl lg:text-5xl font-black tracking-tighter uppercase hover:text-gray-400 transition-colors break-all">
            hello.innoaivators@gmail.com
          </a>
          <div className="mt-24 pt-8 border-t border-[#222] flex flex-col md:flex-row justify-between items-center text-gray-600 font-mono text-xs uppercase tracking-widest">
            <p>&copy; {new Date().getFullYear()} INNOAIVATORS.</p>
            <p>ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
