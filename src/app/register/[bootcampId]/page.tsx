'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { FormInput } from '@/components/ui/FormInput';
import { Button } from '@/components/ui/Button';
import { useBootcamp } from '@/hooks/useBootcamp';

export default function Register({ params }: { params: Promise<{ bootcampId: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { bootcamp, loading, error } = useBootcamp(unwrappedParams.bootcampId);
  
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '',
    education: '',
    experience_level: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bootcamp) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, bootcamp_id: bootcamp.id }),
      });
      
      const data = await res.json();
      if (data.success) {
        // Redirect to payment with registration info
        router.push(`/payment?registrationId=${data.registrationId}&amount=${bootcamp.price}`);
      } else {
        alert(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6 py-12">
        <Card className="w-full max-w-lg">
          {loading ? (
            <div className="text-center py-8 animate-pulse">Loading course details...</div>
          ) : error || !bootcamp ? (
            <div className="text-center py-8 text-red-500">
              {error || 'Course not found. Please select a valid course.'}
              <Button onClick={() => router.push('/')} className="mt-4 w-full">Back to Courses</Button>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center border-b border-gray-800 pb-6">
                <h2 className="text-sm font-semibold text-blue-400 tracking-wider uppercase mb-2">Registering For</h2>
                <h3 className="text-2xl font-bold text-white mb-2">{bootcamp.title}</h3>
                <div className="text-xl font-bold text-emerald-400">₹{bootcamp.price.toLocaleString()}</div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                  label="Full Name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <FormInput
                  label="Email Address"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <FormInput
                  label="Phone Number"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />

                <div className="flex flex-col gap-1 w-full pt-2">
                  <label className="text-sm font-medium text-gray-300">Highest Education</label>
                  <select 
                    required
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={formData.education}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  >
                    <option value="" disabled>Select your education</option>
                    <option value="High School">High School</option>
                    <option value="Undergraduate">Undergraduate (Bachelors)</option>
                    <option value="Postgraduate">Postgraduate (Masters/PhD)</option>
                    <option value="Self Taught / Other">Self Taught / Other</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1 w-full pb-4">
                  <label className="text-sm font-medium text-gray-300">Experience Level</label>
                  <select 
                    required
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={formData.experience_level}
                    onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                  >
                    <option value="" disabled>Select your experience</option>
                    <option value="Beginner">Beginner (No prior experience)</option>
                    <option value="Intermediate">Intermediate (Some coding knowledge)</option>
                    <option value="Advanced">Advanced (Professional developer)</option>
                  </select>
                </div>

                <Button type="submit" className="w-full py-3" isLoading={isSubmitting}>
                  Proceed to Payment (₹{bootcamp.price.toLocaleString()})
                </Button>
              </form>
            </>
          )}
        </Card>
      </main>
      <Footer />
    </div>
  );
}
