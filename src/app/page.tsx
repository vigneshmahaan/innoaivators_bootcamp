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
        <section className="relative pt-8 pb-8 px-6 overflow-hidden flex flex-col items-center justify-center text-center min-h-[calc(100vh-6rem)]">
          <div className="max-w-5xl mx-auto relative z-10 space-y-4">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-none">
              INNOVATE.<br />CREATE.<br />
              <span className="font-mono text-gray-500 tracking-tight">ELEVATE.</span>
            </h1>
            <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto font-medium tracking-wide uppercase">
              Intensive, industry-aligned bootcamps. No fluff. Just raw skills.
            </p>
            <div className="pt-4">
              <a href="#bootcamps" className="inline-flex items-center justify-center px-10 py-4 text-sm font-black uppercase tracking-widest text-black bg-white rounded-full hover:bg-gray-200 transition-colors">
                Explore Bootcamps
              </a>
            </div>
          </div>
        </section>

        {/* About Section - 50/50 Split */}
        <section id="about" className="py-32 px-6 border-t border-[#333]">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 md:gap-24">
              <div>
                <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8">
                  ABOUT US
                </h2>
                <p className="text-gray-400 text-xl leading-relaxed font-medium">
                  At InnoAivators, we bridge the gap between academic learning and industry demands. We don't just build software; we build careers through intensive training programs that equip you with practical experience.
                </p>
              </div>
              <div className="space-y-8 border-l border-[#333] pl-8 md:pl-16">
                <div className="space-y-2">
                  <span className="font-mono text-sm text-gray-500">[01]</span>
                  <h3 className="text-3xl font-bold uppercase tracking-tight">AI AUTOMATION</h3>
                </div>
                <div className="space-y-2">
                  <span className="font-mono text-sm text-gray-500">[02]</span>
                  <h3 className="text-3xl font-bold uppercase tracking-tight">WEB & APP DEV</h3>
                </div>
                <div className="space-y-2">
                  <span className="font-mono text-sm text-gray-500">[03]</span>
                  <h3 className="text-3xl font-bold uppercase tracking-tight">IOT SOLUTIONS</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Internship Highlight - The Challenge */}
        <section className="py-32 px-6 border-t border-[#333] bg-[#050505]">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1">
                <p className="text-xl text-gray-400 leading-relaxed font-medium mb-12">
                  We believe in learning by doing. During our bootcamps, you will be assigned a comprehensive final task. Participants who complete this task efficiently will be directly offered an internship.
                </p>
                <a href="#bootcamps" className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold uppercase tracking-widest text-white border border-white hover:bg-white hover:text-black transition-colors">
                  Accept Challenge
                </a>
              </div>
              <div className="order-1 md:order-2 md:text-right">
                <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
                  THE<br /><span className="text-gray-500">INTERNSHIP</span><br />CHALLENGE
                </h2>
              </div>
            </div>
          </div>
        </section>

        {/* Bootcamps Section */}
        <section id="bootcamps" className="py-32 px-6 border-t border-[#333]">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20">
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">OUR COURSES</h2>
              <p className="text-gray-500 font-mono text-lg uppercase tracking-widest">[ SELECT A PROGRAM ]</p>
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
