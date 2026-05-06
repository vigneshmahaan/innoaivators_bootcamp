'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { deleteRegistration, updateRegistrationPaymentStatus, bulkSendStatusEmails } from '../actions';

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingEmails, setSendingEmails] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState('ALL');
  const [filterYear, setFilterYear] = useState('ALL');
  const [filterEducation, setFilterEducation] = useState('ALL');
  const [filterCourse, setFilterCourse] = useState('ALL');
  const [filterCountry, setFilterCountry] = useState('ALL');
  const [filterState, setFilterState] = useState('ALL');
  const [filterDistrict, setFilterDistrict] = useState('ALL');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  async function fetchRegistrations() {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          users ( name, email, phone, district, state, country ),
          bootcamps ( title )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredRegistrations = registrations.filter(reg => {
    if (filterType !== 'ALL' && reg.student_type?.toLowerCase() !== filterType.toLowerCase()) return false;
    if (filterYear !== 'ALL' && reg.year_of_study?.toLowerCase() !== filterYear.toLowerCase()) return false;
    if (filterEducation !== 'ALL' && reg.education_details?.toLowerCase() !== filterEducation.toLowerCase()) return false;
    if (filterCourse !== 'ALL' && reg.bootcamps?.title !== filterCourse) return false;
    if (filterCountry !== 'ALL' && reg.users?.country?.toLowerCase() !== filterCountry.toLowerCase()) return false;
    if (filterState !== 'ALL' && reg.users?.state?.toLowerCase() !== filterState.toLowerCase()) return false;
    if (filterDistrict !== 'ALL' && reg.users?.district?.toLowerCase() !== filterDistrict.toLowerCase()) return false;
    return true;
  });

  const uniqueYears = Array.from(new Set(registrations.map(r => r.year_of_study).filter(Boolean)));
  const uniqueEducations = Array.from(new Set(registrations.map(r => r.education_details).filter(Boolean)));
  const uniqueCourses = Array.from(new Set(registrations.map(r => r.bootcamps?.title).filter(Boolean)));
  const uniqueCountries = Array.from(new Set(registrations.map(r => r.users?.country).filter(Boolean)));
  const uniqueStates = Array.from(new Set(registrations.map(r => r.users?.state).filter(Boolean)));
  const uniqueDistricts = Array.from(new Set(registrations.map(r => r.users?.district).filter(Boolean)));

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this registration?')) return;
    try {
      await deleteRegistration(id);
      setRegistrations(registrations.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete registration');
    }
  }

  async function handleUpdateStatus(id: string, status: string) {
    try {
      await updateRegistrationPaymentStatus(id, status);
      setRegistrations(registrations.map(r => r.id === id ? { ...r, payment_status: status } : r));
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  }

  async function handleBulkSendEmails() {
    const pendingVerified = registrations.filter(r => r.payment_status === 'verified' && !r.verified_email_sent).length;
    const pendingFailed = registrations.filter(r => r.payment_status === 'failed' && !r.failed_email_sent).length;
    if (pendingVerified === 0 && pendingFailed === 0) {
      alert('No pending emails to send. All students have already been notified.');
      return;
    }
    if (!confirm(`This will send:\n• ${pendingVerified} Verification emails\n• ${pendingFailed} Failure notification emails\n\nContinue?`)) return;
    setSendingEmails(true);
    try {
      const result = await bulkSendStatusEmails();
      alert(`Done!\n✅ ${result.verifiedCount} Verification emails sent\n❌ ${result.failedCount} Failure emails sent`);
      await fetchRegistrations();
    } catch (err) {
      alert('Failed to send emails. Please try again.');
    } finally {
      setSendingEmails(false);
    }
  }

  return (
    <div className="p-6 md:p-12 max-w-[1600px] mx-auto">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2">Registrations</h1>
          <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">[ MANAGE APPLICANTS ]</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <div className="text-right text-xs font-mono text-gray-500 border border-[#333] px-3 py-2 bg-[#0a0a0a]">
            <div className="text-yellow-500 font-bold">{registrations.filter(r => r.payment_status === 'verified' && !r.verified_email_sent).length} pending</div>
            <div>verified emails</div>
          </div>
          <div className="text-right text-xs font-mono text-gray-500 border border-[#333] px-3 py-2 bg-[#0a0a0a]">
            <div className="text-red-500 font-bold">{registrations.filter(r => r.payment_status === 'failed' && !r.failed_email_sent).length} pending</div>
            <div>failed emails</div>
          </div>
          <button
            onClick={handleBulkSendEmails}
            disabled={sendingEmails}
            className="bg-white text-black px-6 py-3 font-bold uppercase text-xs tracking-widest hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-wait"
          >
            {sendingEmails ? 'Sending...' : '📧 Send Pending Emails'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#0a0a0a] border border-[#333] p-6 mb-8 flex flex-wrap gap-6 items-end">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Course</label>
          <select 
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="bg-[#111] border border-[#222] p-3 text-white focus:outline-none focus:border-white transition-colors max-w-[200px] truncate"
          >
            <option value="ALL">All Courses</option>
            {uniqueCourses.map((course: any) => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Student Type</label>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#111] border border-[#222] p-3 text-white focus:outline-none focus:border-white transition-colors"
          >
            <option value="ALL">All Types</option>
            <option value="school">School</option>
            <option value="college">College</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Year of Study</label>
          <select 
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="bg-[#111] border border-[#222] p-3 text-white focus:outline-none focus:border-white transition-colors"
          >
            <option value="ALL">All Years</option>
            {uniqueYears.map((year: any) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Education / Standard</label>
          <select 
            value={filterEducation}
            onChange={(e) => setFilterEducation(e.target.value)}
            className="bg-[#111] border border-[#222] p-3 text-white focus:outline-none focus:border-white transition-colors"
          >
            <option value="ALL">All Education</option>
            {uniqueEducations.map((edu: any) => (
              <option key={edu} value={edu}>{edu}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Country</label>
          <select value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)} className="bg-[#111] border border-[#222] p-3 text-white focus:outline-none focus:border-white transition-colors">
            <option value="ALL">All</option>
            {uniqueCountries.map((c: any) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">State</label>
          <select value={filterState} onChange={(e) => setFilterState(e.target.value)} className="bg-[#111] border border-[#222] p-3 text-white focus:outline-none focus:border-white transition-colors">
            <option value="ALL">All</option>
            {uniqueStates.map((s: any) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">District</label>
          <select value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)} className="bg-[#111] border border-[#222] p-3 text-white focus:outline-none focus:border-white transition-colors">
            <option value="ALL">All</option>
            {uniqueDistricts.map((d: any) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        
        <div className="ml-auto text-sm font-mono text-gray-500">
          Showing {filteredRegistrations.length} results
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500 font-mono tracking-widest uppercase">Loading...</div>
      ) : error ? (
        <div className="p-6 border border-red-900 bg-red-950/20 text-red-500 font-mono text-sm uppercase">{error}</div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="p-12 border border-[#333] bg-[#111] text-center">
          <h3 className="text-xl font-bold uppercase tracking-widest text-gray-500">NO REGISTRATIONS FOUND</h3>
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#333]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#111] border-b border-[#333] text-xs uppercase tracking-widest text-gray-400">
                <th className="p-4 font-bold">Applicant</th>
                <th className="p-4 font-bold">Course</th>
                <th className="p-4 font-bold">Background</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222] bg-[#050505]">
              {filteredRegistrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-[#0a0a0a] transition-colors group">
                  <td className="p-4">
                    <div className="font-bold text-white mb-1">{reg.users?.name}</div>
                    <div className="text-xs text-gray-500 font-mono">{reg.users?.email}</div>
                    <div className="text-xs text-gray-500 font-mono mb-2">{reg.users?.phone}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-300 font-medium">{reg.bootcamps?.title}</div>
                    <div className="text-xs text-gray-600 font-mono mt-1">{new Date(reg.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">
                      {[reg.student_type, reg.education_details, reg.year_of_study ? `(${reg.year_of_study})` : null].filter(Boolean).join(' • ')}
                    </div>
                    <div className="text-sm text-gray-300 truncate max-w-[200px]" title={reg.institution_name}>
                      {reg.institution_name}
                    </div>
                    {(reg.users?.district || reg.users?.state || reg.users?.country) && (
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                        {[reg.users?.district, reg.users?.state, reg.users?.country].filter(Boolean).join(', ')}
                      </div>
                    )}
                    {(reg.department || reg.field_of_study) && (
                      <div className="text-xs text-gray-500 mt-2">
                        {[reg.department, reg.field_of_study ? `(${reg.field_of_study})` : null].filter(Boolean).join(' ')}
                      </div>
                    )}
                    {reg.future_interests && (
                      <div className="text-[10px] text-gray-400 italic mt-2 line-clamp-2" title={reg.future_interests}>
                        Interests: {reg.future_interests}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <select 
                      value={reg.payment_status}
                      onChange={(e) => handleUpdateStatus(reg.id, e.target.value)}
                      className={`text-xs font-bold uppercase tracking-widest px-3 py-1 border rounded ${
                        reg.payment_status === 'verified' ? 'bg-green-950/30 text-green-500 border-green-900/50' : 
                        reg.payment_status === 'failed' ? 'bg-red-950/30 text-red-500 border-red-900/50' : 
                        'bg-yellow-950/30 text-yellow-500 border-yellow-900/50'
                      } focus:outline-none`}
                    >
                      <option className="bg-[#111] text-yellow-500" value="pending">Pending</option>
                      <option className="bg-[#111] text-green-500" value="verified">Verified</option>
                      <option className="bg-[#111] text-red-500" value="failed">Failed</option>
                    </select>
                    {reg.payment_proof_url && reg.payment_proof_url !== 'pending-upload' && (
                      <div className="mt-2">
                        <a href={reg.payment_proof_url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:text-blue-300 hover:underline uppercase tracking-widest">
                          View Proof ↗
                        </a>
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(reg.id)}
                      className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-400 px-3 py-1 border border-transparent hover:border-red-900 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
