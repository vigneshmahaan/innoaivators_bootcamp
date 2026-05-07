'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="sticky top-0 z-[100] w-full backdrop-blur-xl bg-black/80 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 md:h-24 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 md:w-12 md:h-12 overflow-hidden rounded-lg">
            <Image 
              src="/logo.png" 
              alt="InnoAivators Logo" 
              fill
              className="object-contain" 
            />
          </div>
          <span className="text-xl md:text-2xl font-black tracking-tighter uppercase text-white group-hover:text-gray-400 transition-colors">
            InnoAivators
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-10 text-[10px] font-black tracking-[0.2em] uppercase text-gray-500">
          <a href="/#about" className="hover:text-white transition-colors">About Us</a>
          <a href="/#bootcamps" className="hover:text-white transition-colors">Courses</a>
          <Link href="/#bootcamps" className="px-8 py-3 bg-white text-black font-black hover:bg-gray-200 transition-all rounded-full text-[10px] tracking-[0.2em] shadow-lg shadow-white/5">
            Register Now
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={toggleMenu}
          className="md:hidden p-2 text-white focus:outline-none"
          aria-label="Toggle menu"
        >
          <div className="w-6 h-5 relative flex flex-col justify-between">
            <span className={`w-full h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`w-full h-0.5 bg-white transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-full h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </div>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-[90] bg-black/95 backdrop-blur-2xl md:hidden transition-all duration-500 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="flex flex-col items-center justify-center h-full gap-12 text-center p-6">
          <a 
            href="/#about" 
            onClick={toggleMenu}
            className="text-3xl font-black uppercase tracking-tighter text-white hover:text-gray-400 transition-colors"
          >
            About Us
          </a>
          <a 
            href="/#bootcamps" 
            onClick={toggleMenu}
            className="text-3xl font-black uppercase tracking-tighter text-white hover:text-gray-400 transition-colors"
          >
            Our Courses
          </a>
          <Link 
            href="/#bootcamps" 
            onClick={toggleMenu}
            className="px-12 py-5 bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-gray-200 transition-all rounded-full"
          >
            Register Now
          </Link>
          
          <div className="mt-12 pt-12 border-t border-white/10 w-full flex flex-col items-center gap-4">
             <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.3em]">Connect With Us</p>
             <a href="mailto:hello.innoaivators@gmail.com" className="text-white font-bold text-sm tracking-widest uppercase">hello.innoaivators@gmail.com</a>
          </div>
        </div>
      </div>
    </nav>
  );
}

