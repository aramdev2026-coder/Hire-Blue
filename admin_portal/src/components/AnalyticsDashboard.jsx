import React, { useEffect, useState } from 'react';
import { BarChart3, Loader } from 'lucide-react';
import { apiFetch } from '../api';
import { formatStatus } from '../constants';

function BarChart({ data, labelKey, valueKey, color = 'emerald' }) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1);
  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div key={item[labelKey]} className="flex items-center gap-2 text-xs">
          <span className="w-32 truncate text-slate-600">{formatStatus(item[labelKey]) || item[labelKey]}</span>
          <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full bg-${color}-500 rounded-full`}
              style={{ width: `${(item[valueKey] / max) * 100}%`, backgroundColor: color === 'emerald' ? '#10b981' : color === 'indigo' ? '#6366f1' : '#f59e0b' }}
            />
          </div>
          <span className="w-8 text-right font-mono">{item[valueKey]}</span>
        </div>
      ))}
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

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [f, lb, src, dist, ttp, pr, ag] = await Promise.all([
          apiFetch('/api/super-admin/analytics/funnel'),
          apiFetch('/api/super-admin/analytics/sub-admin-leaderboard'),
          apiFetch('/api/super-admin/analytics/source-breakdown'),
          apiFetch('/api/super-admin/analytics/district-demand'),
          apiFetch('/api/super-admin/analytics/time-to-placement'),
          apiFetch('/api/super-admin/analytics/placement-rate'),
          apiFetch('/api/super-admin/analytics/aging'),
        ]);
        setFunnel(f.funnel || []);
        setLeaderboard(lb.leaderboard || []);
        setSources(src.breakdown || []);
        setDistricts(dist.districts || []);
        setTimeToPlacement(ttp.timeToPlacement || []);
        setPlacementRates(pr.rates || []);
        setAging(ag.aging || {});
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
      <div className="flex justify-center py-16">
        <Loader className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-emerald-600" />
        <h3 className="font-bold text-xl">Platform Analytics</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <h4 className="font-semibold text-sm mb-3 text-slate-700">Candidate Pipeline Funnel</h4>
          <BarChart data={funnel} labelKey="status" valueKey="count" color="emerald" />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <h4 className="font-semibold text-sm mb-3 text-slate-700">Sub-Admin Leaderboard (Placed)</h4>
          <BarChart data={leaderboard.map((l) => ({ name: l.name, count: l.placed }))} labelKey="name" valueKey="count" color="indigo" />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <h4 className="font-semibold text-sm mb-3 text-slate-700">Source Breakdown</h4>
          <BarChart data={sources.map((s) => ({ source: s.source, count: s.count }))} labelKey="source" valueKey="count" color="amber" />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <h4 className="font-semibold text-sm mb-3 text-slate-700">District Supply vs Demand</h4>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {districts.slice(0, 15).map((d) => (
              <div key={d.district} className="flex items-center gap-2 text-xs">
                <span className="w-24 truncate">{d.district}</span>
                <div className="flex-1 flex gap-1 h-3">
                  <div className="bg-emerald-400 rounded-sm" style={{ width: `${Math.min(d.supply * 4, 100)}px` }} title={`Supply: ${d.supply}`} />
                  <div className="bg-rose-400 rounded-sm" style={{ width: `${Math.min(d.demand * 4, 100)}px` }} title={`Demand: ${d.demand}`} />
                </div>
                <span className="text-slate-400 w-16">{d.supply}/{d.demand}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <h4 className="font-semibold text-sm mb-3 text-slate-700">Avg Time to Placement (days)</h4>
          <BarChart data={timeToPlacement.map((t) => ({ source: t.source, count: t.avgDays }))} labelKey="source" valueKey="count" color="emerald" />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <h4 className="font-semibold text-sm mb-3 text-slate-700">Placement Success Rate by Source</h4>
          <BarChart data={placementRates.map((r) => ({ source: `${r.source} (${r.rate}%)`, count: r.placed }))} labelKey="source" valueKey="count" color="indigo" />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <h4 className="font-semibold text-sm mb-3 text-slate-700">Candidate Aging (idle &gt; 7 days)</h4>
        {Object.keys(aging).length === 0 ? (
          <p className="text-sm text-slate-400">No aging candidates.</p>
        ) : (
          Object.entries(aging).map(([subAdmin, list]) => (
            <div key={subAdmin} className="mb-3">
              <p className="text-xs font-semibold text-slate-600 mb-1">{subAdmin} ({list.length})</p>
              <div className="flex flex-wrap gap-1">
                {list.slice(0, 10).map((c) => (
                  <span key={c.id} className="text-[10px] bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded">
                    {c.fullName || c.id.slice(0, 6)} · {c.idleDays}d
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
