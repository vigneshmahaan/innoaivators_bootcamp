'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { createBatch, assignBatch, deleteBatch, triggerMeetingLinkEmail, autoAssignBatches } from '../actions';

export default function BatchesPage() {
  const [bootcamps, setBootcamps] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'assign' | 'links'>('assign');
  const [selectedBootcampId, setSelectedBootcampId] = useState<string>('');
  const [newBatchName, setNewBatchName] = useState('');
  const [autoAssigning, setAutoAssigning] = useState(false);

  // Meeting Link states
  const [meetingInputs, setMeetingInputs] = useState<Record<string, { timing: string, link: string }>>({});

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [bootcampsRes, batchesRes, regsRes] = await Promise.all([
        supabase.from('bootcamps').select('*').order('created_at', { ascending: false }),
        supabase.from('batches').select('*').order('created_at', { ascending: false }),
        supabase.from('registrations').select(`*, users(name, email)`).order('created_at', { ascending: false })
      ]);

      setBootcamps(bootcampsRes.data || []);
      setBatches(batchesRes.data || []);
      setRegistrations(regsRes.data || []);
      
      if (bootcampsRes.data && bootcampsRes.data.length > 0) {
        setSelectedBootcampId(prev => prev || (bootcampsRes.data[0]?.id || ''));
      }

      // Initialize inputs
      const inputs: Record<string, { timing: string, link: string }> = {};
      batchesRes.data?.forEach(b => {
        inputs[b.id] = { timing: b.timing || '', link: b.meeting_link || '' };
      });
      setMeetingInputs(inputs);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBootcampId || !newBatchName) return;
    try {
      await createBatch(selectedBootcampId, newBatchName);
      setNewBatchName('');
      await fetchData(); // Refresh
    } catch (err) {
      alert('Failed to create batch');
    }
  };

  const handleDeleteBatch = async (batchId: string, batchName: string) => {
    if (!confirm(`Are you sure you want to delete "${batchName}"? All assigned students will be unassigned.`)) return;
    try {
      await deleteBatch(batchId);
      await fetchData();
    } catch (err) {
      alert('Failed to delete batch');
    }
  };

  const handleAssignBatch = async (regId: string, batchId: string) => {
    try {
      await assignBatch(regId, batchId);
      // Update local state to reflect change quickly
      setRegistrations(registrations.map(r => r.id === regId ? { ...r, batch_id: batchId } : r));
    } catch (err) {
      alert('Failed to assign batch');
    }
  };

  const handleSendLink = async (batchId: string) => {
    const inputs = meetingInputs[batchId];
    if (!inputs?.timing || !inputs?.link) {
      alert('Please provide both timing and meeting link');
      return;
    }
    
    try {
      const res = await triggerMeetingLinkEmail(batchId, inputs.timing, inputs.link);
      alert(`Success! Sent meeting details to ${res.count} verified students.`);
      await fetchData();
    } catch (err) {
      alert('Failed to send emails');
    }
  };

  const handleAutoAssign = async () => {
    if (!selectedBootcampId) return;
    if (currentBatches.length === 0) {
      alert('Please create at least one batch first before auto-distributing.');
      return;
    }
    const unassignedCount = verifiedUnassignedCount;
    if (unassignedCount === 0) {
      alert('All verified students are already assigned to a batch!');
      return;
    }
    if (!confirm(`Auto-distribute ${unassignedCount} verified students across ${currentBatches.length} batches?`)) return;
    setAutoAssigning(true);
    try {
      const res = await autoAssignBatches(selectedBootcampId);
      await fetchData();
      alert(`Done! Successfully assigned ${res.count} verified students to batches.`);
    } catch (err: any) {
      alert(err.message || 'Failed to auto-assign batches');
    } finally {
      setAutoAssigning(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500 font-mono tracking-widest uppercase">Loading Data...</div>;

  const currentBatches = batches.filter(b => b.bootcamp_id === selectedBootcampId);
  const currentRegs = registrations.filter(r => r.bootcamp_id === selectedBootcampId);
  const verifiedUnassignedCount = currentRegs.filter(r => r.payment_status === 'verified' && !r.batch_id).length;

  return (
    <div className="p-6 md:p-12 max-w-[1600px] mx-auto space-y-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-[#222] pb-12">
        <div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-3 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
            Batch Manager
          </h1>
          <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.3em] flex items-center gap-2">
            <span className="w-8 h-[1px] bg-primary"></span>
            SEPARATE AND COMMUNICATE
          </p>
        </div>

        {/* Course Selector - Redesigned with overlay pattern for perfect truncation */}
        <div className="bg-[#0a0a0a] border border-[#333] p-1 pr-4 flex items-center gap-4 w-full lg:max-w-2xl group hover:border-primary/50 transition-colors relative">
          <div className="bg-[#111] px-4 py-3 border-r border-[#333] shrink-0">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 whitespace-nowrap">Course Context</label>
          </div>
          
          <div className="flex-1 min-w-0 relative py-2">
            <div className="text-white font-bold uppercase tracking-wider text-[11px] truncate pr-4">
              {bootcamps.find(b => b.id === selectedBootcampId)?.title || 'Select Course'}
            </div>
            <select 
              value={selectedBootcampId}
              onChange={(e) => setSelectedBootcampId(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            >
              {bootcamps.map(b => (
                <option key={b.id} value={b.id} className="bg-black text-white">{b.title}</option>
              ))}
            </select>
          </div>

          <div className="text-gray-600 group-hover:text-primary transition-colors shrink-0">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-[#222]">
        <button 
          onClick={() => setActiveTab('assign')}
          className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'assign' ? 'text-primary' : 'text-gray-500 hover:text-gray-300'}`}
        >
          01. Assign Students
          {activeTab === 'assign' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('links')}
          className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'links' ? 'text-primary' : 'text-gray-500 hover:text-gray-300'}`}
        >
          02. Communication Hub
          {activeTab === 'links' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>}
        </button>
      </div>


      {activeTab === 'assign' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          <div className="xl:col-span-4 space-y-6">
            <div className="bg-[#0a0a0a] border border-[#222] p-8 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>
              <h3 className="text-sm font-black uppercase mb-6 tracking-[0.2em] text-gray-400">Initialize Batch</h3>
              <form onSubmit={handleCreateBatch} className="space-y-4 relative z-10">
                <input 
                  type="text" 
                  required
                  value={newBatchName}
                  onChange={e => setNewBatchName(e.target.value)}
                  placeholder="e.g. MORNING SQUAD (BATCH A)" 
                  className="w-full bg-[#111] border border-[#333] p-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-primary transition-all placeholder:text-gray-700"
                />
                <button type="submit" className="w-full bg-white text-black py-4 font-black uppercase text-[10px] tracking-[0.3em] hover:bg-primary hover:text-white transition-all shadow-xl">
                  Deploy Batch
                </button>
              </form>
            </div>

            {/* Auto-Distribute Banner - Redesigned */}
            <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-[#333] p-8 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Smart Distribution</h4>
                </div>
                <p className="text-[10px] text-gray-500 font-mono uppercase leading-relaxed mb-6">
                  {verifiedUnassignedCount} verified students detected.<br/>
                  Ready for split across {currentBatches.length} batch(es).
                </p>
                <button
                  onClick={handleAutoAssign}
                  disabled={autoAssigning}
                  className="w-full border border-primary/30 bg-primary/5 text-primary py-4 font-black uppercase text-[10px] tracking-[0.3em] hover:bg-primary hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {autoAssigning ? 'PROCESSING...' : '⚡ TRIGGER AUTO-DISTRIBUTION'}
                </button>
              </div>
            </div>
          </div>

          <div className="xl:col-span-8">
            <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-[#222] flex items-center justify-between bg-[#111]/50">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Registry List</h3>
                <span className="text-[9px] font-mono text-gray-600">{currentRegs.length} RECORDS FOUND</span>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#222] text-[9px] uppercase tracking-[0.3em] text-gray-500">
                    <th className="p-6 font-black">Student Profile</th>
                    <th className="p-6 font-black">Authentication</th>
                    <th className="p-6 font-black">Assignment Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#111]">
                  {currentRegs.map(reg => (
                    <tr key={reg.id} className="hover:bg-[#111]/30 transition-colors group">
                      <td className="p-6">
                        <div className="font-black text-white text-xs uppercase tracking-tight group-hover:text-primary transition-colors">{reg.users?.name}</div>
                        <div className="text-[10px] text-gray-500 font-mono mt-1">{reg.users?.email}</div>
                      </td>
                      <td className="p-6">
                        <span className={`text-[8px] px-2 py-1 uppercase tracking-widest font-black border ${
                          reg.payment_status === 'verified' ? 'text-green-500 border-green-500/20 bg-green-500/5' : 'text-gray-600 border-[#222]'
                        }`}>
                          {reg.payment_status}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="relative max-w-[200px]">
                          <select 
                            value={reg.batch_id || ''}
                            onChange={(e) => handleAssignBatch(reg.id, e.target.value)}
                            className="w-full bg-[#111] border border-[#333] p-3 text-white text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                          >
                            <option value="">-- UNASSIGNED --</option>
                            {currentBatches.map(b => (
                              <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                {currentRegs.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-gray-500 font-mono uppercase">No students found for this course</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}

      {activeTab === 'links' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {currentBatches.map(batch => {
            const batchRegs = currentRegs.filter(r => r.batch_id === batch.id);
            const verifiedCount = batchRegs.filter(r => r.payment_status === 'verified').length;

            return (
              <div key={batch.id} className="bg-[#0a0a0a] border border-[#222] p-8 rounded-2xl relative overflow-hidden group hover:border-primary/30 transition-all">
                <div className="flex justify-between items-start mb-8 border-b border-[#111] pb-6">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-wider text-white group-hover:text-primary transition-colors">{batch.name}</h3>
                    <p className="text-[10px] font-mono text-gray-500 mt-2 uppercase tracking-widest">
                      {batchRegs.length} TOTAL • {verifiedCount} VERIFIED RECORDS
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDeleteBatch(batch.id, batch.name)}
                    className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/5 rounded transition-all group/btn"
                    title="Delete Batch"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Class Timing</label>
                    <input 
                      type="text" 
                      value={meetingInputs[batch.id]?.timing || ''}
                      onChange={(e) => setMeetingInputs({...meetingInputs, [batch.id]: {...meetingInputs[batch.id], timing: e.target.value}})}
                      placeholder="e.g. Saturday 10:00 AM - 12:00 PM"
                      className="w-full bg-black border border-[#333] p-3 text-white focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Google Meet / Zoom Link</label>
                    <input 
                      type="url" 
                      value={meetingInputs[batch.id]?.link || ''}
                      onChange={(e) => setMeetingInputs({...meetingInputs, [batch.id]: {...meetingInputs[batch.id], link: e.target.value}})}
                      placeholder="https://meet.google.com/..."
                      className="w-full bg-black border border-[#333] p-3 text-white focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <button 
                    onClick={() => handleSendLink(batch.id)}
                    className="w-full mt-4 bg-primary text-white py-4 font-bold uppercase tracking-widest text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    Send Details to Batch 
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">{verifiedCount} emails</span>
                  </button>
                  <p className="text-[10px] text-gray-500 text-center font-mono uppercase mt-2">
                    Note: Emails will only be sent to verified students.
                  </p>
                </div>
              </div>
            );
          })}
          {currentBatches.length === 0 && (
            <div className="col-span-full p-12 text-center border border-[#333] bg-[#111]">
              <h3 className="text-xl font-bold uppercase tracking-widest text-gray-500">No Batches Created Yet</h3>
              <p className="text-sm text-gray-600 mt-2">Go to the Assign Students tab to create a batch.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
