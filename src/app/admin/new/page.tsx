'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { createBootcamp } from '../actions';

const initialState = {
  error: null as string | null,
};

export default function NewBootcampPage() {
  const [state, formAction, pending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await createBootcamp(formData);
      if (result?.error) {
        return { error: result.error };
      }
      return { error: null };
    },
    initialState
  );

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto">
      <div className="mb-12">
        <Link href="/admin" className="text-gray-500 hover:text-white transition-colors font-mono text-sm uppercase tracking-widest mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2">New Course</h1>
        <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">[ ADD TO CATALOG ]</p>
      </div>

      <div className="bg-[#0a0a0a] border border-[#333] p-8 md:p-12">
        <form action={formAction} className="space-y-8">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Course Title</label>
            <input 
              type="text" 
              name="title" 
              required
              className="w-full bg-[#111] border border-[#222] p-4 text-white font-bold text-lg uppercase tracking-wider focus:outline-none focus:border-white transition-colors"
              placeholder="e.g. ADVANCED REACT MASTERY"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Overview / Description</label>
            <textarea 
              name="description" 
              required
              rows={5}
              className="w-full bg-[#111] border border-[#222] p-4 text-gray-300 font-medium leading-relaxed focus:outline-none focus:border-white transition-colors"
              placeholder="Provide a compelling overview of the course content..."
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Amount to Pay (INR)</label>
            <input 
              type="number" 
              name="price" 
              required
              min="0"
              className="w-full md:w-1/2 bg-[#111] border border-[#222] p-4 text-white font-mono text-lg focus:outline-none focus:border-white transition-colors"
              placeholder="e.g. 4999"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Duration (in days)</label>
            <input 
              type="number" 
              name="duration_days" 
              required
              min="1"
              className="w-full md:w-1/2 bg-[#111] border border-[#222] p-4 text-white font-mono text-lg focus:outline-none focus:border-white transition-colors"
              placeholder="e.g. 30"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Topics Covered (Comma separated or short list)</label>
            <textarea 
              name="topics_covered" 
              required
              rows={3}
              className="w-full bg-[#111] border border-[#222] p-4 text-gray-300 font-medium leading-relaxed focus:outline-none focus:border-white transition-colors"
              placeholder="e.g. React, Next.js, TailwindCSS..."
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Final Task / Internship Challenge</label>
            <textarea 
              name="final_task" 
              required
              rows={4}
              className="w-full bg-[#111] border border-[#222] p-4 text-gray-300 font-medium leading-relaxed focus:outline-none focus:border-white transition-colors"
              placeholder="Describe the final project participants will build..."
            ></textarea>
          </div>

          {state?.error && (
            <div className="p-4 border border-red-900 bg-red-950/20 text-red-500 font-mono text-sm uppercase">
              {state.error}
            </div>
          )}

          <div className="pt-8 border-t border-[#222] flex justify-end">
            <button 
              type="submit" 
              disabled={pending}
              className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {pending ? 'SAVING...' : 'PUBLISH COURSE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
