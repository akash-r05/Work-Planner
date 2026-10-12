import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  ArrowRight,
  Calendar,
  Sparkles,
  Plus,
  FolderKanban,
  CheckSquare,
  Square,
  Activity as ActivityIcon,
} from 'lucide-react';
import { IDashboardSummary, ITask, IProject } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { SpatialCard } from '../../components/effects/SpatialCard';
import { ProgressRing } from '../../components/effects/ProgressRing';

interface DashboardViewProps {
  summary: IDashboardSummary | null;
  projects: IProject[];
  onOpenNewTaskModal: () => void;
  onNavigateTab: (tab: any) => void;
  onOpenTaskDetails: (task: ITask) => void;
  onToggleCompleteTask: (task: ITask) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  projects,
  onOpenNewTaskModal,
  onNavigateTab,
  onOpenTaskDetails,
  onToggleCompleteTask,
}) => {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const todayFormatted = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const total = summary?.totalTasks || 0;
  const completed = summary?.completedTasks || 0;
  const inProgress = summary?.inProgressTasks || 0;
  const overdue = summary?.overdueTasks || 0;
  const rate = summary?.completionRate || 0;

  return (
    <div className="space-y-6">
      {/* Personalized Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>{todayFormatted}</span>
            <span>·</span>
            <span className="text-violet-400">Production Sprint</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100 mt-1">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Member'} 👋
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            You have <span className="text-cyan-400 font-semibold tabular-nums">{inProgress}</span> tasks in progress and{' '}
            <span className="text-rose-400 font-semibold tabular-nums">{overdue}</span> overdue items.
          </p>
        </div>

        <button
          onClick={onOpenNewTaskModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-violet-500/20 active:scale-95 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Quick Create Task</span>
        </button>
      </div>

      {/* 4 Key Summary 3D Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <SpatialCard className="p-4" tiltIntensity={5} onClick={() => onNavigateTab('tasks')}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Deliverables</span>
            <Layers className="w-4 h-4 text-violet-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold tabular-nums text-slate-100">{total}</span>
            <span className="text-[11px] text-violet-400 font-medium">Across all projects</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">Tracked in database</div>
        </SpatialCard>

        {/* Completed */}
        <SpatialCard className="p-4" tiltIntensity={5} onClick={() => onNavigateTab('tasks')}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Resolved Tasks</span>
            <ProgressRing percentage={rate} size={32} strokeWidth={4} showText={false} color="#34D399" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold tabular-nums text-emerald-400">{completed}</span>
            <span className="text-[11px] text-emerald-400 font-semibold tabular-nums">{rate}% rate</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">Completed sprint deliverables</div>
        </SpatialCard>

        {/* In Progress */}
        <SpatialCard className="p-4" tiltIntensity={5} onClick={() => onNavigateTab('kanban')}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>In Execution</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold tabular-nums text-cyan-400">{inProgress}</span>
            <span className="text-[11px] text-cyan-400 font-medium">Active work</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">Assigned & in flight</div>
        </SpatialCard>

        {/* Overdue */}
        <SpatialCard className="p-4" tiltIntensity={5} onClick={() => onNavigateTab('tasks')}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Overdue Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold tabular-nums text-rose-400">{overdue}</span>
            <span className={`text-[11px] font-semibold ${overdue > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {overdue > 0 ? 'Requires attention' : 'On schedule'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">Past target delivery deadline</div>
        </SpatialCard>
      </div>

      {/* Main Section Split: Agenda & Deadlines / Projects & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Today's Agenda & Upcoming Deadlines */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Agenda */}
          <div className="rounded-2xl border border-slate-800 bg-[#141B2D] p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Today's Execution Agenda
                </h3>
              </div>
              <span className="text-xs text-slate-400 tabular-nums">
                {summary?.todayAgenda?.length || 0} items scheduled
              </span>
            </div>

            {!summary?.todayAgenda || summary.todayAgenda.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-400/80 mx-auto mb-2" />
                <span>No urgent tasks due today. Everything on schedule!</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {summary.todayAgenda.map(task => {
                  const isDone = task.status === 'completed';
                  const proj = projects.find(p => p._id === task.projectId);
                  return (
                    <div
                      key={task._id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-violet-500/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <button
                          onClick={() => onToggleCompleteTask(task)}
                          className="text-slate-400 hover:text-emerald-400 shrink-0"
                        >
                          {isDone ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                        <div
                          onClick={() => onOpenTaskDetails(task)}
                          className="flex flex-col min-w-0 cursor-pointer flex-1"
                        >
                          <span
                            className={`text-xs font-medium truncate ${
                              isDone ? 'line-through text-slate-400' : 'text-slate-200'
                            }`}
                          >
                            {task.title}
                          </span>
                          {proj && (
                            <span
                              className="text-[10px] font-medium mt-0.5"
                              style={{ color: proj.color || '#8B5CF6' }}
                            >
                              {proj.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ml-2 shrink-0 ${
                          task.priority === 'urgent'
                            ? 'bg-rose-950/80 text-rose-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming Deadlines */}
          <div className="rounded-2xl border border-slate-800 bg-[#141B2D] p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Upcoming Deadlines (Next 7 Days)
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('calendar')}
                className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
              >
                <span>View timeline</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {!summary?.upcomingDeadlines || summary.upcomingDeadlines.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No approaching deadlines within the next 7 days.
              </div>
            ) : (
              <div className="space-y-2">
                {summary.upcomingDeadlines.map(task => {
                  const proj = projects.find(p => p._id === task.projectId);
                  return (
                    <div
                      key={task._id}
                      onClick={() => onOpenTaskDetails(task)}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-medium text-slate-200 truncate">{task.title}</span>
                        {proj && <span className="text-[10px] text-slate-400">{proj.name}</span>}
                      </div>
                      <span className="text-xs font-medium text-amber-400 tabular-nums shrink-0 ml-3">
                        Due {new Date(task.dueDate!).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Active Projects & Recent Activity */}
        <div className="space-y-6">
          {/* Active Initiatives Showcase */}
          <div className="rounded-2xl border border-slate-800 bg-[#141B2D] p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-violet-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Active Projects
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('projects')}
                className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
              >
                <span>All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {projects.slice(0, 3).map(proj => {
                return (
                  <div
                    key={proj._id}
                    onClick={() => onNavigateTab('projects')}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-violet-500/40 cursor-pointer transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: proj.color || '#8B5CF6' }}
                        />
                        <span className="text-xs font-semibold text-slate-200 truncate">
                          {proj.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block tabular-nums">
                        {proj.taskCount || 0} deliverables
                      </span>
                    </div>

                    <ProgressRing
                      percentage={proj.progressPercentage || 0}
                      size={38}
                      strokeWidth={3.5}
                      color={proj.color || '#8B5CF6'}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="rounded-2xl border border-slate-800 bg-[#141B2D] p-5 shadow-xl">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80 mb-4">
              <ActivityIcon className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Recent Workspace Activity
              </h3>
            </div>

            <div className="space-y-3">
              {!summary?.recentActivities || summary.recentActivities.length === 0 ? (
                <div className="text-xs text-slate-400 py-4 text-center">No recent activities logged.</div>
              ) : (
                summary.recentActivities.slice(0, 5).map(act => (
                  <div key={act._id} className="flex items-start gap-2.5 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-slate-300 font-medium">{act.action}</span>
                      <span className="text-[10px] text-slate-400 tabular-nums">
                        {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
