import Link from 'next/link';

interface BootcampCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
}

export function BootcampCard({ id, title, description, price }: BootcampCardProps) {
  return (
    <div className="bg-[#0a0a0a] border border-[#333] hover:border-white transition-all duration-300 rounded-none p-6 relative group overflow-hidden">
      <div className="absolute inset-0 bg-[#111] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
      <div className="relative z-10 flex flex-col h-full">
        <h3 className="text-xl font-bold uppercase tracking-wider mb-2 text-white group-hover:text-white transition-colors">{title}</h3>
        <p className="text-gray-400 mb-8 text-sm line-clamp-3">{description}</p>
        <div className="flex flex-col gap-4 mt-auto">
          <span className="text-white font-mono text-lg">₹{price.toLocaleString('en-IN')}</span>
          <div className="flex items-center gap-3">
            <Link
              href={`/bootcamp/${id}`}
              className="flex-1 text-center px-4 py-2 bg-transparent border border-white text-white hover:bg-white/10 transition-colors uppercase text-[10px] font-bold tracking-widest"
            >
              Details
            </Link>
            <Link
              href={`/register?bootcampId=${id}`}
              className="flex-1 text-center px-4 py-2 bg-white border border-white text-black hover:bg-gray-200 transition-colors uppercase text-[10px] font-bold tracking-widest"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
