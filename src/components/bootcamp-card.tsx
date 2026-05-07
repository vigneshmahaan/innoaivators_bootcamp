import Link from 'next/link';

interface BootcampCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
}

export function BootcampCard({ id, title, description, price }: BootcampCardProps) {
  return (
    <div className="bg-[#050505] border border-white/10 hover:border-white transition-all duration-700 p-8 relative group overflow-hidden flex flex-col h-full">
      <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-in-out"></div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-8">
          <span className="font-mono text-[10px] text-gray-600 block mb-2 tracking-[0.3em]">LIMITED ACCESS</span>
          <h3 className="text-2xl font-black uppercase tracking-tighter leading-none text-white transition-colors">{title}</h3>
        </div>
        
        <p className="text-gray-500 mb-12 text-sm line-clamp-4 font-medium leading-relaxed uppercase tracking-wide">
          {description}
        </p>
        
        <div className="mt-auto space-y-6">
          <div className="flex items-center justify-between border-t border-white/10 pt-6">
            <span className="text-white font-mono text-xl font-bold tracking-tighter italic">₹{price.toLocaleString('en-IN')}</span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Duration: 6 Days</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Link
              href={`/bootcamp/${id}`}
              className="text-center py-3.5 bg-transparent border border-white/20 text-white hover:bg-white/5 transition-all uppercase text-[9px] font-black tracking-[0.2em]"
            >
              Learn More
            </Link>
            <Link
              href={`/register?bootcampId=${id}`}
              className="text-center py-3.5 bg-white text-black hover:bg-gray-200 transition-all uppercase text-[9px] font-black tracking-[0.2em] shadow-lg shadow-white/5"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
