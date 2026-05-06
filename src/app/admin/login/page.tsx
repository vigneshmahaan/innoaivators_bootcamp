'use client';

import { useActionState } from 'react';
import { loginAdmin } from '../actions';

const initialState = {
  error: null as string | null,
};

export default function AdminLogin() {
  const [state, formAction, pending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await loginAdmin(formData);
      if (result?.error) {
        return { error: result.error };
      }
      return { error: null };
    },
    initialState
  );

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-[#111] border border-[#333] p-8">
        <h1 className="text-3xl font-black uppercase text-white mb-2 tracking-tighter">Admin Access</h1>
        <p className="text-gray-500 font-mono text-sm mb-8 uppercase tracking-widest">[ SECURE PORTAL ]</p>
        
        <form action={formAction} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Password</label>
            <input 
              type="password" 
              name="password" 
              required
              className="w-full bg-[#0a0a0a] border border-[#333] p-4 text-white font-mono focus:outline-none focus:border-white transition-colors"
              placeholder="Enter admin password"
            />
          </div>
          
          {state?.error && (
            <div className="p-4 border border-red-900 bg-red-950/20 text-red-500 font-mono text-sm">
              {state.error}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={pending}
            className="w-full bg-white text-black font-black uppercase tracking-widest py-4 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {pending ? 'VERIFYING...' : 'LOGIN'}
          </button>
        </form>
      </div>
    </div>
  );
}
