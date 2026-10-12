import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  FolderKanban,
} from 'lucide-react';
import { api } from '../../services/api';
import { SpatialCard } from '../../components/effects/SpatialCard';
import { ProgressRing } from '../../components/effects/ProgressRing';

export const AnalyticsView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [productivityData, setProductivityData] = useState<any>(null);
  const [taskData, setTaskData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [prodRes, taskRes] = await Promise.all([
          api.getProductivityAnalytics(),
          api.getTaskAnalytics(),
        ]);
        if (prodRes.success) setProductivityData(prodRes);
        if (taskRes.success) setTaskData(taskRes);
      } catch (err) {
        console.error('Error loading analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mx-auto mb-3" />
        <span>Aggregating workspace telemetry and metrics...</span>
      </div>
    );
  }

  const weeklyTrend = productivityData?.weeklyTrend || [];
  const statusData = taskData?.statusData || [];
  const priorityData = taskData?.priorityData || [];
  const projectBreakdown = taskData?.projectBreakdown || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Performance Analytics</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Audited production metrics computed dynamically from your database records.
        </p>
      </div>

      {/* KPI Metric Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SpatialCard className="p-4" tiltIntensity={4}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Overall Velocity</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums text-slate-100">
              {productivityData?.completionRate || 0}%
            </span>
            <span className="text-xs text-emerald-400 font-medium">on targets</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Ratio of resolved deliverables</p>
        </SpatialCard>

        <SpatialCard className="p-4" tiltIntensity={4}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Completed Units</span>
            <CheckCircle2 className="w-4 h-4 text-violet-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums text-violet-400">
              {productivityData?.totalCompleted || 0}
            </span>
            <span className="text-xs text-slate-400">of {productivityData?.totalTasks || 0} total</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Finished tasks in system</p>
        </SpatialCard>

        <SpatialCard className="p-4" tiltIntensity={4}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Initiatives</span>
            <FolderKanban className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums text-cyan-400">
              {projectBreakdown.length}
            </span>
            <span className="text-xs text-slate-400">projects</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Scoped initiatives tracked</p>
        </SpatialCard>

        <SpatialCard className="p-4" tiltIntensity={4}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Completion Depth</span>
            <ProgressRing
              percentage={productivityData?.completionRate || 0}
              size={34}
              strokeWidth={4}
              showText={false}
            />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums text-amber-400">
              {statusData.find((s: any) => s.name === 'In Progress')?.value || 0}
            </span>
            <span className="text-xs text-slate-400">in execution</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Active WIP concurrency</p>
        </SpatialCard>
      </div>

      {/* Main Charts Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Completion & Creation Trend */}
        <div className="rounded-2xl border border-slate-800 bg-[#141B2D] p-5 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                7-Day Velocity Activity
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Deliverables created vs completed</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="created" fill="#6366F1" name="Created" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" fill="#10B981" name="Completed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Priority Distribution */}
        <div className="rounded-2xl border border-slate-800 bg-[#141B2D] p-5 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Priority Allocation
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Workload density by triage level</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                <XAxis type="number" stroke="#64748B" fontSize={11} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]}>
                  {priorityData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || '#8B5CF6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Project Breakdown Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#141B2D] p-5 shadow-xl">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider pb-3 border-b border-slate-800/80 mb-4">
          Initiative Completion Matrix
        </h3>

        {projectBreakdown.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No projects available for breakdown.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Initiative</th>
                  <th className="pb-3 font-semibold text-right">Total Deliverables</th>
                  <th className="pb-3 font-semibold text-right">Completed</th>
                  <th className="pb-3 font-semibold text-right">In Flight</th>
                  <th className="pb-3 font-semibold text-right">Execution Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {projectBreakdown.map((proj: any) => {
                  const rate = proj.total > 0 ? Math.round((proj.completed / proj.total) * 100) : 0;
                  return (
                    <tr key={proj.id} className="hover:bg-slate-900/40">
                      <td className="py-3 flex items-center gap-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: proj.color || '#8B5CF6' }}
                        />
                        <span className="font-medium text-slate-200">{proj.name}</span>
                      </td>
                      <td className="py-3 text-right tabular-nums text-slate-300">{proj.total}</td>
                      <td className="py-3 text-right tabular-nums text-emerald-400">{proj.completed}</td>
                      <td className="py-3 text-right tabular-nums text-cyan-400">{proj.inProgress}</td>
                      <td className="py-3 text-right tabular-nums font-semibold text-slate-100">
                        {rate}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
