import React, { useState } from 'react';
import {
  Search, Plus, Loader, ChevronDown, ChevronUp, MessageSquare, BarChart3,
} from 'lucide-react';
import { ALL_CANDIDATE_STATUSES, formatStatus } from '../constants';
import AddCandidateModal from './AddCandidateModal';

const SUB_ADMIN_STATUSES = ALL_CANDIDATE_STATUSES.filter(
  (s) => !['PLACED', 'REJECTED_BY_EMPLOYER'].includes(s),
);

export default function SubAdminCandidates({
  candidates, loading, stats, onRefresh, onAddCandidate, onUpdateStatus, onAddNote, onFetchNotes,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);
  const [notes, setNotes] = useState({});
  const [noteText, setNoteText] = useState('');
  const [callbackDate, setCallbackDate] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const displayedCandidates = candidates.filter((c) => {
    const matchesSearch = c.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phoneNumber1?.includes(searchQuery);
    const matchesFilter = filter === 'ALL' || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleExpand = async (candidateId) => {
    if (expandedId === candidateId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(candidateId);
    if (!notes[candidateId]) {
      const logs = await onFetchNotes(candidateId);
      setNotes((prev) => ({ ...prev, [candidateId]: logs }));
    }
  };

  const handleAddNote = async (candidateId) => {
    if (!noteText.trim()) return;
    setSubmitting(true);
    try {
      await onAddNote(candidateId, noteText, callbackDate || null);
      const logs = await onFetchNotes(candidateId);
      setNotes((prev) => ({ ...prev, [candidateId]: logs }));
      setNoteText('');
      setCallbackDate('');
      onRefresh();
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (candidateId, status) => {
    let note = null;
    if (status === 'BLACKLISTED') {
      note = window.prompt('Reason for blacklisting (required):');
      if (!note?.trim()) return;
    }
    await onUpdateStatus(candidateId, status, note);
    onRefresh();
  };

  const handleCreate = async (payload) => {
    setSubmitting(true);
    try {
      await onAddCandidate(payload);
      setShowAddModal(false);
      onRefresh();
    } catch (err) {
      console.warn('Failed to create candidate:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const isCallbackDue = (candidate) => {
    const logs = notes[candidate.id] || [];
    const due = logs.find((l) => l.callbackAt && new Date(l.callbackAt) <= new Date());
    return !!due;
  };

  return (
    <div className="space-y-4 w-full px-1 sm:px-0">
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Added This Week', value: stats.addedThisWeek, color: 'emerald' },
            { label: 'Verified', value: stats.verified, color: 'blue' },
            { label: 'Placed', value: stats.placed, color: 'purple' },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
                <BarChart3 className="w-3.5 h-3.5" /> {s.label}
              </div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search your assigned candidates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Candidate
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          {ALL_CANDIDATE_STATUSES.map((s) => (
            <option key={s} value={s}>{formatStatus(s)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader className="w-6 h-6 animate-spin text-emerald-600" /></div>
      ) : displayedCandidates.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
          No assigned candidates found in your queue.
        </div>
      ) : (
        <div className="space-y-3">
          {displayedCandidates.map((candidate) => (
            <div key={candidate.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-slate-900">{candidate.fullName || 'N/A'}</h4>
                    {isCallbackDue(candidate) && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                        CALLBACK DUE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-emerald-600">#{candidate.id}</p>
                  <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                    <p><strong>Mobile:</strong> {candidate.phoneNumber1}</p>
                    <p><strong>District:</strong> {candidate.presentDistrict || 'N/A'}</p>
                    <p><strong>Roles:</strong> {candidate.jobRoles?.join(', ') || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={candidate.status}
                    onChange={(e) => handleStatusChange(candidate.id, e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 cursor-pointer"
                  >
                    {SUB_ADMIN_STATUSES.map((s) => (
                      <option key={s} value={s}>{formatStatus(s)}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleExpand(candidate.id)}
                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    {expandedId === candidate.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {expandedId === candidate.id && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <MessageSquare className="w-4 h-4" /> Communication Log
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {(notes[candidate.id] || []).length === 0 ? (
                      <p className="text-xs text-slate-400">No notes yet.</p>
                    ) : (
                      (notes[candidate.id] || []).map((log) => (
                        <div key={log.id} className="bg-white border border-slate-200 rounded-lg p-2 text-xs">
                          <p className="text-slate-700">{log.note}</p>
                          <p className="text-slate-400 mt-1">
                            {log.author?.name} · {new Date(log.createdAt).toLocaleString()}
                            {log.callbackAt && ` · Callback: ${new Date(log.callbackAt).toLocaleDateString()}`}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Add a note..."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg"
                    />
                    <input
                      type="datetime-local"
                      value={callbackDate}
                      onChange={(e) => setCallbackDate(e.target.value)}
                      className="px-3 py-2 text-xs border border-slate-200 rounded-lg"
                    />
                    <button
                      onClick={() => handleAddNote(candidate.id)}
                      disabled={submitting}
                      className="px-4 py-2 bg-emerald-600 text-white text-xs font-medium rounded-lg cursor-pointer disabled:opacity-60"
                    >
                      Add Note
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddCandidateModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreate}
          submitting={submitting}
        />
      )}
    </div>
  );
}
