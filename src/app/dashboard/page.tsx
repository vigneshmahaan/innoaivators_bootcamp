import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white">
      <Navbar />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-8 text-white">Student Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-xl font-semibold mb-4 text-emerald-400">My Bootcamps</h3>
            <p className="text-gray-400">
              You are successfully enrolled in the Premium Web Dev Bootcamp.
              (Note: In a real app, this data would be fetched from Supabase using user session).
            </p>
          </Card>
          
          <Card>
            <h3 className="text-xl font-semibold mb-4 text-blue-400">Upcoming Resources</h3>
            <ul className="text-gray-400 space-y-2">
              <li>• Welcome Orientation (Jan 10)</li>
              <li>• Access Discord Server</li>
              <li>• Pre-requisite Setup Guide</li>
            </ul>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
