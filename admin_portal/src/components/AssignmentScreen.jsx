import React, { useState, useMemo } from 'react';
import { Search, Users, Loader, AlertTriangle } from 'lucide-react';
import { ALL_CANDIDATE_STATUSES, formatStatus, sourceBadgeClass } from '../constants';
import CandidateDetailsModal from './CandidateDetailsModal';

import { useConfirm } from '../context/ConfirmContext';

export default function AssignmentScreen({
  candidates, subAdmins, loading, onAssign, duplicates = [], statusCounts = {},
}) {
  const { showAlert } = useConfirm();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING_ADMIN_CALL');
  const [districtFilter, setDistrictFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState('ALL');
  const [selected, setSelected] = useState(new Set());
  const [subAdminId, setSubAdminId] = useState('');
  const [roundRobin, setRoundRobin] = useState(false);
  const [selectedSubAdmins, setSelectedSubAdmins] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const duplicatePhones = useMemo(() => {
    const set = new Set();
    duplicates.forEach((g) => set.add(g.phoneNumber1));
    return set;
  }, [duplicates]);

  const districts = useMemo(() => [...new Set(candidates.map((c) => c.presentDistrict).filter(Boolean))].sort(), [candidates]);
  const roles = useMemo(() => [...new Set(candidates.flatMap((c) => c.jobRoles || []))].sort(), [candidates]);

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (search && !c.fullName?.toLowerCase().includes(search.toLowerCase()) && !c.phoneNumber1?.includes(search)) return false;
      if (statusFilter && c.status !== statusFilter) return false;
      if (districtFilter && c.presentDistrict !== districtFilter) return false;
      if (roleFilter && !c.jobRoles?.includes(roleFilter)) return false;
      if (sourceFilter && c.source !== sourceFilter) return false;
      if (assignmentFilter === 'ASSIGNED' && !c.assignedToId && !c.assignedTo) return false;
      if (assignmentFilter === 'UNASSIGNED' && (c.assignedToId || c.assignedTo)) return false;
      return true;
    });
  }, [candidates, search, statusFilter, districtFilter, roleFilter, sourceFilter, assignmentFilter]);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((c) => c.id)));
  };

  const handleAssign = () => {
    const ids = [...selected];
    if (!ids.length) return showAlert('Assignment Alert', 'Select at least one candidate.', 'warning');
    if (roundRobin) {
      if (!selectedSubAdmins.length) return showAlert('Assignment Alert', 'Select sub-admins for round-robin.', 'warning');
      onAssign({ candidateIds: ids, subAdminIds: selectedSubAdmins, strategy: 'ROUND_ROBIN' });
    } else {
      if (!subAdminId) return showAlert('Assignment Alert', 'Select a sub-admin.', 'warning');
      onAssign({ candidateIds: ids, subAdminId });
    }
    setSelected(new Set());
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-900">Candidate Assignment</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg" />
          </div>
          <select value={assignmentFilter} onChange={(e) => setAssignmentFilter(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-2 py-2 bg-slate-50 text-slate-700 font-medium cursor-pointer">
            <option value="ALL">All Candidates</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="UNASSIGNED">Unassigned</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-2 py-2">
            <option value="">All Statuses</option>
            {ALL_CANDIDATE_STATUSES.map((s) => {
              const count = statusCounts[s] ?? 0;
              return (
                <option key={s} value={s}>
                  {formatStatus(s)} ({count})
                </option>
              );
            })}
          </select>
          <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-2 py-2">
            <option value="">All Districts</option>
            {districts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-2 py-2">
            <option value="">All Roles</option>
            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="flex flex-wrap gap-3 items-end border-t border-slate-100 pt-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={roundRobin} onChange={(e) => setRoundRobin(e.target.checked)} />
            Round-robin across multiple sub-admins
          </label>
          {!roundRobin ? (
            <select value={subAdminId} onChange={(e) => setSubAdminId(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-2">
              <option value="">Select Sub-Admin</option>
              {subAdmins.filter((s) => s.isActive).map((sa) => (
                <option key={sa.id} value={sa.id}>{sa.name}{sa.region ? ` (${sa.region})` : ''}</option>
              ))}
            </select>
          ) : (
            <div className="flex flex-wrap gap-2">
              {subAdmins.filter((s) => s.isActive).map((sa) => (
                <label key={sa.id} className="flex items-center gap-1 text-xs bg-slate-100 px-2 py-1 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSubAdmins.includes(sa.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedSubAdmins([...selectedSubAdmins, sa.id]);
                      else setSelectedSubAdmins(selectedSubAdmins.filter((id) => id !== sa.id));
                    }}
                  />
                  {sa.name}
                </label>
              ))}
            </div>
          )}
          <button onClick={handleAssign} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer">
            Assign {selected.size || 0} Selected
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader className="w-6 h-6 animate-spin text-indigo-600" /></div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-3"><input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={selectAll} /></th>
                <th className="p-3">Name</th>
                <th className="p-3">Phone</th>
                <th className="p-3">District</th>
                <th className="p-3">Status</th>
                <th className="p-3">Source</th>
                <th className="p-3">Assigned To</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="p-3"><input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} /></td>
                  <td className="p-3 font-medium">
                    <span 
                      onClick={() => setSelectedCandidate(c)} 
                      className="hover:underline hover:text-indigo-650 cursor-pointer text-indigo-600 transition-colors"
                    >
                      {c.fullName || 'N/A'}
                    </span>
                    {duplicatePhones.has(c.phoneNumber1) && (
                      <AlertTriangle className="inline w-3.5 h-3.5 text-amber-500 ml-1" title="Duplicate phone" />
                    )}
                  </td>
                  <td className="p-3 font-mono text-xs">{c.phoneNumber1}</td>
                  <td className="p-3">{c.presentDistrict || '-'}</td>
                  <td className="p-3"><span className="text-xs bg-slate-100 px-2 py-0.5 rounded">{formatStatus(c.status)}</span></td>
                  <td className="p-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${sourceBadgeClass(c.sourceLabel)}`}>
                      {c.sourceLabel || c.source}
                    </span>
                  </td>
                  <td className="p-3 text-xs">{c.assignedTo?.name || 'Unassigned'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedCandidate && (
        <CandidateDetailsModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
}
