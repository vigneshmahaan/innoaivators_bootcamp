'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { createBatch, assignBatch, triggerMeetingLinkEmail, autoAssignBatches } from '../actions';

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
        setSelectedBootcampId(bootcampsRes.data[0].id);
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
      alert(`Done! Successfully assigned ${res.count} verified students to batches.`);
      await fetchData();
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
    <div className="p-6 md:p-12 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
        <div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2">Batch Manager</h1>
          <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">[ SEPARATE AND COMMUNICATE ]</p>
        </div>

        {/* Course Selector - Moved to Top */}
        <div className="bg-[#0a0a0a] border border-[#333] p-4 flex items-center gap-4 flex-1 max-w-xl">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 shrink-0">COURSE CONTEXT:</label>
          <select 
            value={selectedBootcampId}
            onChange={(e) => setSelectedBootcampId(e.target.value)}
            className="bg-transparent border-none p-0 text-white font-bold uppercase tracking-wider focus:outline-none flex-1 truncate cursor-pointer"
          >
            {bootcamps.map(b => (
              <option key={b.id} value={b.id} className="bg-black text-white">{b.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-[#333]">
        <button 
          onClick={() => setActiveTab('assign')}
          className={`py-4 px-6 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 ${activeTab === 'assign' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
        >
          1. Assign Students
        </button>
        <button 
          onClick={() => setActiveTab('links')}
          className={`py-4 px-6 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 ${activeTab === 'links' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
        >
          2. Send Meeting Links
        </button>
      </div>


      {activeTab === 'assign' && (
        <div className="space-y-8">
          <div className="bg-[#111] border border-[#333] p-6 rounded-xl">
            <h3 className="text-xl font-bold uppercase mb-4 tracking-wider">Create New Batch</h3>
            <form onSubmit={handleCreateBatch} className="flex gap-4">
              <input 
                type="text" 
                required
                value={newBatchName}
                onChange={e => setNewBatchName(e.target.value)}
                placeholder="e.g. Morning Squad (Batch A)" 
                className="bg-black border border-[#333] p-3 flex-1 focus:outline-none focus:border-primary transition-colors text-white"
              />
              <button type="submit" className="bg-white text-black px-8 font-bold uppercase text-sm tracking-widest hover:bg-gray-200 transition-colors">
                Create
              </button>
            </form>
          </div>

          {/* Auto-Distribute Banner */}
          <div className="bg-[#0a0a0a] border border-dashed border-[#444] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold uppercase tracking-widest text-white">Auto-Distribute Verified Students</h4>
              <p className="text-xs text-gray-500 mt-1 font-mono">
                {verifiedUnassignedCount} verified & unassigned • will be split evenly across {currentBatches.length} batch(es)
              </p>
            </div>
            <button
              onClick={handleAutoAssign}
              disabled={autoAssigning}
              className="shrink-0 bg-white text-black px-8 py-3 font-bold uppercase text-sm tracking-widest hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-wait"
            >
              {autoAssigning ? 'Distributing...' : '⚡ Auto-Distribute'}
            </button>
          </div>

          <div className="bg-[#111] border border-[#333] rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0a0a0a] border-b border-[#333] text-xs uppercase tracking-widest text-gray-400">
                  <th className="p-4 font-bold">Student</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Assign to Batch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {currentRegs.map(reg => (
                  <tr key={reg.id} className="hover:bg-[#151515]">
                    <td className="p-4">
                      <div className="font-bold text-white">{reg.users?.name}</div>
                      <div className="text-xs text-gray-500 font-mono">{reg.users?.email}</div>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] px-2 py-1 uppercase tracking-widest font-bold border ${
                        reg.payment_status === 'verified' ? 'text-green-500 border-green-900/50 bg-green-950/30' : 'text-gray-400 border-[#333]'
                      }`}>
                        {reg.payment_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <select 
                        value={reg.batch_id || ''}
                        onChange={(e) => handleAssignBatch(reg.id, e.target.value)}
                        className="bg-black border border-[#333] p-2 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                      >
                        <option value="">-- Unassigned --</option>
                        {currentBatches.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
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
      )}

      {activeTab === 'links' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {currentBatches.map(batch => {
            const batchRegs = currentRegs.filter(r => r.batch_id === batch.id);
            const verifiedCount = batchRegs.filter(r => r.payment_status === 'verified').length;

            return (
              <div key={batch.id} className="bg-[#111] border border-[#333] p-6 rounded-xl">
                <div className="flex justify-between items-start mb-6 border-b border-[#222] pb-4">
                  <div>
                    <h3 className="text-2xl font-bold uppercase tracking-wider text-white">{batch.name}</h3>
                    <p className="text-xs font-mono text-gray-500 mt-1">
                      {batchRegs.length} Total Students ({verifiedCount} Verified)
                    </p>
                  </div>
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
