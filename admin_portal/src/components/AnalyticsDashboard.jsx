import React, { useEffect, useState } from 'react';
import { BarChart3, Loader, Users, Briefcase } from 'lucide-react';
import { formatStatus } from '../constants';
import {
  fetchFunnelData,
  fetchLeaderboardData,
  fetchSourceBreakdownData,
  fetchDistrictDemandData,
  fetchTimeToPlacementData,
  fetchPlacementRateData,
  fetchAgingData,
  fetchActivityLogs,
  fetchSummaryData,
} from '../services/analyticsService';

function BarChart({ data, labelKey, valueKey, color = 'indigo' }) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1);
  return (
    <div className="space-y-3">
      {data.map((item) => {
        const displayLabel = formatStatus(item[labelKey]) || item[labelKey];
        return (
          <div key={item[labelKey]} className="flex items-center gap-3 text-xs">
            <span className="w-40 truncate text-slate-500 font-medium" title={displayLabel}>{displayLabel}</span>
            <div className="flex-1 bg-slate-50 rounded-full h-4 overflow-hidden border border-slate-100">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${(item[valueKey] / max) * 100}%`, 
                  backgroundColor: color === 'emerald' ? '#10b981' : color === 'indigo' ? '#4f46e5' : '#f59e0b' 
                }}
              />
            </div>
            <span className="w-8 text-right font-mono font-semibold text-slate-700">{item[valueKey]}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [funnel, setFunnel] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [sources, setSources] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [timeToPlacement, setTimeToPlacement] = useState([]);
  const [placementRates, setPlacementRates] = useState([]);
  const [aging, setAging] = useState({});
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState({ employers: 0, requirements: 0, vacancies: 0 });

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [f, lb, src, dist, ttp, pr, ag, al, summ] = await Promise.all([
          fetchFunnelData(),
          fetchLeaderboardData(),
          fetchSourceBreakdownData(),
          fetchDistrictDemandData(),
          fetchTimeToPlacementData(),
          fetchPlacementRateData(),
          fetchAgingData(),
          fetchActivityLogs(),
          fetchSummaryData().catch(() => ({ summary: { employers: 0, requirements: 0, vacancies: 0 } })),
        ]);
        setFunnel(f.funnel || []);
        setLeaderboard(lb.leaderboard || []);
        setSources(src.breakdown || []);
        setDistricts(dist.districts || []);
        setTimeToPlacement(ttp.timeToPlacement || []);
        setPlacementRates(pr.rates || []);
        setAging(ag.aging || {});
        setLogs(al.logs || []);
        setSummary(summ.summary || { employers: 0, requirements: 0, vacancies: 0 });
      } catch (err) {
        console.error('Analytics load failed:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
        <BarChart3 className="w-5 h-5 text-indigo-600" />
        <h3 className="font-bold text-xl text-slate-850">Platform Performance Analytics</h3>
      </div>

      {/* Platform Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registered Employers</p>
            <h3 className="text-2xl font-extrabold text-slate-850 mt-1">{summary.employers}</h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-650 rounded-xl border border-indigo-100">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Requirements</p>
            <h3 className="text-2xl font-extrabold text-slate-850 mt-1">{summary.requirements}</h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-650 rounded-xl border border-indigo-100">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Open Openings (Vacancies)</p>
            <h3 className="text-2xl font-extrabold text-slate-850 mt-1">{summary.vacancies}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-650 rounded-xl border border-emerald-100">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h4 className="font-bold text-sm mb-4 text-slate-800">Candidate Pipeline Funnel</h4>
          <BarChart data={funnel} labelKey="status" valueKey="count" color="indigo" />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h4 className="font-bold text-sm mb-4 text-slate-800">Sub-Admin Leaderboard (Placed)</h4>
          <BarChart data={leaderboard.map((l) => ({ name: l.name, count: l.placed }))} labelKey="name" valueKey="count" color="indigo" />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h4 className="font-bold text-sm mb-4 text-slate-800">Source Breakdown</h4>
          <BarChart data={sources.map((s) => ({ source: s.source, count: s.count }))} labelKey="source" valueKey="count" color="indigo" />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h4 className="font-bold text-sm mb-4 text-slate-800">District Supply vs Demand</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {(() => {
              const maxVal = Math.max(...districts.map(d => Math.max(d.supply, d.demand)), 1);
              return districts.slice(0, 15).map((d) => {
                const supplyPercent = (d.supply / maxVal) * 100;
                const demandPercent = (d.demand / maxVal) * 100;
                return (
                  <div key={d.district} className="flex items-center gap-3 text-xs pb-1.5 border-b border-slate-50 last:border-0">
                    <span className="w-24 truncate text-slate-550 font-medium" title={d.district}>{d.district}</span>
                    <div className="flex-1 flex flex-col gap-1 h-auto bg-slate-50 border border-slate-100 rounded-md p-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="bg-indigo-500 h-1.5 rounded-xs transition-all duration-350" style={{ width: `${supplyPercent}%` }} title={`Supply: ${d.supply}`} />
                        <span className="text-[9px] font-mono text-indigo-600 font-bold">{d.supply}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="bg-rose-500 h-1.5 rounded-xs transition-all duration-350" style={{ width: `${demandPercent}%` }} title={`Demand: ${d.demand}`} />
                        <span className="text-[9px] font-mono text-rose-600 font-bold">{d.demand}</span>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h4 className="font-bold text-sm mb-4 text-slate-800">Avg Time to Placement (days)</h4>
          <BarChart data={timeToPlacement.map((t) => ({ source: t.source, count: t.avgDays }))} labelKey="source" valueKey="count" color="indigo" />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h4 className="font-bold text-sm mb-4 text-slate-800">Placement Success Rate by Source</h4>
          <BarChart data={placementRates.map((r) => ({ source: `${r.source} (${r.rate}%)`, count: r.placed }))} labelKey="source" valueKey="count" color="indigo" />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h4 className="font-bold text-sm mb-4 text-slate-800">Candidate Aging (idle &gt; 7 days)</h4>
        {Object.keys(aging).length === 0 ? (
          <p className="text-sm text-slate-400">No aging candidates.</p>
        ) : (
          Object.entries(aging).map(([subAdmin, list]) => (
            <div key={subAdmin} className="mb-4">
              <p className="text-xs font-semibold text-slate-600 mb-2">{subAdmin} ({list.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {list.slice(0, 10).map((c) => (
                  <span key={c.id} className="text-[10px] bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded font-medium">
                    {c.fullName || String(c.id).slice(0, 6)} · {c.idleDays}d
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h4 className="font-bold text-sm mb-4 text-slate-800">Sub-Admin Audit Activity Logs</h4>
        {logs.length === 0 ? (
          <p className="text-sm text-slate-400">No activity logs recorded in the last 30 days.</p>
        ) : (
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-2">
            {logs.map((log) => (
              <div key={log.id} className="py-3 flex items-start gap-3">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded shrink-0 ${
                  log.type === 'status' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                  log.type === 'assignment' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                  'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>
                  {log.type}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-700 leading-normal">{log.text}</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">{new Date(log.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
