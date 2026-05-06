import Image from 'next/image';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-black/90 border-b border-[#333]">
      <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        <a href="https://innoaivators.com/" target="_blank" rel="noreferrer" className="flex items-center gap-3 group">
          <Image src="/logo.png" alt="InnoAivators Logo" width={64} height={64} className="object-contain" />
          <span className="text-3xl font-black tracking-tighter uppercase text-white hover:text-gray-300 transition-colors">
            InnoAivators
          </span>
        </a>

        <div className="hidden md:flex items-center gap-10 text-xs font-bold tracking-widest uppercase text-gray-400">
          <a href="#about" className="hover:text-white transition-colors">About Us</a>
          <a href="#bootcamps" className="hover:text-white transition-colors">OUR CourseS</a>
          <a href="#bootcamps" className="px-8 py-3 bg-white text-black font-bold hover:bg-gray-200 transition-colors rounded-full">
            Register Now
          </a>
        </div>
      </div>
    </nav>
  );
}
