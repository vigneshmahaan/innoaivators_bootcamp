'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <nav className="sticky top-0 z-[100] w-full backdrop-blur-xl bg-black/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 md:h-24 flex items-center justify-between">
          <Link href="https://innoaivators.com" target="_blank" className="flex items-center gap-3 group">
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
            className="md:hidden flex flex-col gap-1.5 p-2 focus:outline-none"
            aria-label="Toggle menu"
          >
            <span className="w-6 h-0.5 bg-white"></span>
            <span className="w-4 h-0.5 bg-white self-end"></span>
          </button>
        </div>
      </nav>

      {/* NEW FULL-SCREEN MOBILE MENU UI */}
      <div
        className={`fixed inset-0 z-[200] bg-black transition-all duration-500 ease-[cubic-bezier(0.85,0,0.15,1)] ${isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}
      >
        {/* Close Button */}
        <button
          onClick={toggleMenu}
          className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center text-white border border-white/10 rounded-full hover:bg-white/5 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col h-full justify-between p-8 md:p-12">
          {/* Menu Branding */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 relative rounded-md overflow-hidden">
              <Image src="/logo.png" alt="Logo" fill className="object-contain" />
            </div>
            <span className="font-black tracking-tighter uppercase text-white">InnoAivators</span>
          </div>

          {/* Main Links */}
          <div className="flex flex-col gap-4">
            <p className="text-gray-600 font-mono text-[9px] uppercase tracking-[0.5em] mb-4">Navigation</p>
            <a
              href="/#about"
              onClick={toggleMenu}
              className="text-5xl font-black uppercase tracking-tighter text-white hover:text-gray-500 transition-colors"
            >
              About Us
            </a>
            <a
              href="/#bootcamps"
              onClick={toggleMenu}
              className="text-5xl font-black uppercase tracking-tighter text-white hover:text-gray-500 transition-colors"
            >
              Courses
            </a>
          </div>

          {/* Footer of Menu */}
          <div className="space-y-8">
            <Link
              href="/#bootcamps"
              onClick={toggleMenu}
              className="block w-full py-5 bg-white text-black text-center font-black uppercase tracking-[0.3em] text-xs hover:bg-gray-200 transition-all rounded-none"
            >
              Register Now
            </Link>

            <div className="pt-8 border-t border-white/10 grid grid-cols-1 gap-4">
              <div>
                <p className="text-gray-600 font-mono text-[8px] uppercase tracking-[0.4em] mb-2">Inquiries</p>
                <a href="mailto:hello.innoaivators@gmail.com" className="text-white font-bold text-[10px] tracking-widest uppercase hover:text-gray-400">hello.innoaivators@gmail.com</a>
              </div>
              <p className="text-gray-700 font-mono text-[8px] uppercase tracking-[0.3em]">&copy; {new Date().getFullYear()} INNOAIVATORS TECH SOLUTION</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

