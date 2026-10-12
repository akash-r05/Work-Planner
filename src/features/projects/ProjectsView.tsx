import React, { useState } from 'react';
import {
  Plus,
  FolderKanban,
  Calendar,
  CheckCircle2,
  Clock,
  MoreVertical,
  Edit2,
  Trash2,
  Archive,
  ArrowRight,
  ListTodo,
} from 'lucide-react';
import { IProject, ITask } from '../../types';
import { SpatialCard } from '../../components/effects/SpatialCard';
import { ProgressRing } from '../../components/effects/ProgressRing';

interface ProjectsViewProps {
  projects: IProject[];
  tasks: ITask[];
  onOpenNewProjectModal: () => void;
  onEditProject: (project: IProject) => void;
  onDeleteProject: (projectId: string) => void;
  onArchiveProject: (projectId: string, isArchived: boolean) => void;
  onSelectProjectForFilter: (projectId: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  tasks,
  onOpenNewProjectModal,
  onEditProject,
  onDeleteProject,
  onArchiveProject,
  onSelectProjectForFilter,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<IProject | null>(null);

  const filteredProjects = projects.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Projects & Initiatives</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor real-time completion progress, scope metrics, and deliverable schedules.
          </p>
        </div>

        <button
          onClick={onOpenNewProjectModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-violet-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 rounded-2xl bg-[#141B2D]/80 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1 p-1 bg-slate-900/80 rounded-xl">
          {[
            { id: 'all', label: 'All Projects' },
            { id: 'active', label: 'Active' },
            { id: 'planning', label: 'Planning' },
            { id: 'completed', label: 'Completed' },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s.id
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter by name..."
          className="px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-violet-500"
        />
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-slate-800 bg-[#141B2D]/40">
          <FolderKanban className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">No projects found</h3>
          <p className="text-xs text-slate-400 mt-1">Start by creating an initiative to organize tasks.</p>
          <button
            onClick={onOpenNewProjectModal}
            className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-xs font-medium text-white rounded-lg transition-colors"
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map(proj => {
            const projectTasks = tasks.filter(t => t.projectId === proj._id);
            const total = projectTasks.length;
            const completed = projectTasks.filter(t => t.status === 'completed').length;
            const inProgress = projectTasks.filter(t => t.status === 'in_progress').length;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <SpatialCard
                key={proj._id}
                className="p-5 flex flex-col justify-between border-slate-800 bg-[#141B2D]"
                tiltIntensity={6}
              >
                <div>
                  {/* Top Bar with Color Indicator and Actions */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3.5 h-3.5 rounded-md shadow-sm"
                        style={{ backgroundColor: proj.color || '#8B5CF6' }}
                      />
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        {proj.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditProject(proj)}
                        className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                        title="Edit project"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteProject(proj._id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-violet-300 transition-colors">
                    {proj.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {proj.description || 'No description provided.'}
                  </p>
                </div>

                {/* Progress & Metrics Section */}
                <div className="mt-6 pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <ListTodo className="w-3.5 h-3.5 text-slate-400" />
                        <span className="tabular-nums font-semibold text-slate-200">{total}</span>
                        <span>total deliverables</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px]">
                        <span className="text-emerald-400 tabular-nums">{completed} done</span>
                        <span>·</span>
                        <span className="text-cyan-400 tabular-nums">{inProgress} active</span>
                      </div>
                    </div>

                    {/* Circular 3D Progress Ring */}
                    <ProgressRing
                      percentage={progress}
                      size={48}
                      strokeWidth={4.5}
                      color={proj.color || '#8B5CF6'}
                    />
                  </div>

                  {/* Timeline strip & jump button */}
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 tabular-nums">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{proj.dueDate ? new Date(proj.dueDate).toLocaleDateString() : 'No date'}</span>
                    </span>

                    <button
                      onClick={() => onSelectProjectForFilter(proj._id)}
                      className="text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 transition-colors"
                    >
                      <span>Filter tasks</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </SpatialCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
