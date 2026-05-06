import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { logoutAdmin } from './actions';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.has('admin_auth');

  // We don't redirect in layout for /admin/login because it would cause an infinite loop
  // but we can show a different UI if not authenticated.
  // Actually, standard Next.js pattern: check auth in layout. If not auth AND not on login page, redirect.
  // Since we can't easily read pathname in server layout, we just render the children.
  // Individual pages will handle their own redirects if needed.

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black flex flex-col">
      {isAuthenticated && (
        <header className="border-b border-[#333] bg-[#0a0a0a] sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/admin" className="font-black text-xl tracking-tighter uppercase">
              INNOAIVATORS <span className="text-gray-500 font-mono text-sm tracking-widest">[ADMIN]</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
                View Site
              </Link>
              <form action={logoutAdmin}>
                <button type="submit" className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors">
                  Logout
                </button>
              </form>
            </div>
          </div>
          <div className="border-t border-[#222] bg-[#111]">
            <div className="max-w-7xl mx-auto px-6 flex items-center gap-8">
              <Link href="/admin" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white py-4 border-b-2 border-transparent hover:border-white transition-all">
                Catalog
              </Link>
              <Link href="/admin/registrations" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white py-4 border-b-2 border-transparent hover:border-white transition-all">
                Registrations
              </Link>
              <Link href="/admin/batches" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white py-4 border-b-2 border-transparent hover:border-white transition-all">
                Batches
              </Link>
              <Link href="/admin/analytics" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white py-4 border-b-2 border-transparent hover:border-white transition-all">
                Analytics
              </Link>
            </div>
          </div>
        </header>
      )}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
