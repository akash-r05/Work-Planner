import React from 'react';
import {
  X,
  Calendar,
  CheckCircle2,
  Clock,
  Tag,
  FolderKanban,
  Trash2,
  Edit,
  CheckSquare,
  Square,
  AlertTriangle,
} from 'lucide-react';
import { ITask, IProject, TaskStatus } from '../../types';

interface TaskDetailDrawerProps {
  task: ITask | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: ITask) => void;
  onDelete: (taskId: string) => void;
  onToggleChecklist: (taskId: string, checklistId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  projects: IProject[];
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  task,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleChecklist,
  onStatusChange,
  projects,
}) => {
  if (!isOpen || !task) return null;

  const project = projects.find(p => p._id === task.projectId);
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate).getTime() < Date.now() &&
    task.status !== 'completed';

  const completedChecklistCount = task.checklist.filter(c => c.completed).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-[#070A14]/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#141B2D] border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  task.priority === 'urgent'
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                    : task.priority === 'high'
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                    : task.priority === 'medium'
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {task.priority.toUpperCase()}
              </span>

              {isOverdue && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-950/40 border border-rose-500/20 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Overdue</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(task)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Edit task"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(task._id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 text-left">
            {/* Title */}
            <div>
              <h2 className="text-xl font-bold text-slate-100 leading-snug">{task.title}</h2>
              {project && (
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                  <FolderKanban className="w-3.5 h-3.5 text-violet-400" />
                  <span>Project:</span>
                  <span className="text-slate-200 font-medium">{project.name}</span>
                </div>
              )}
            </div>

            {/* Quick Status Control */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Workflow Status</label>
              <div className="grid grid-cols-2 gap-2">
                {(['todo', 'in_progress', 'in_review', 'completed'] as TaskStatus[]).map(s => (
                  <button
                    key={s}
                    onClick={() => onStatusChange(task._id, s)}
                    className={`px-3 py-2 text-xs font-medium rounded-xl border text-center transition-all ${
                      task.status === s
                        ? 'bg-violet-600/20 border-violet-500 text-violet-200 shadow-sm'
                        : 'border-slate-800 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                    }`}
                  >
                    {s === 'todo'
                      ? 'To Do'
                      : s === 'in_progress'
                      ? 'In Progress'
                      : s === 'in_review'
                      ? 'In Review'
                      : 'Completed'}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                {task.description || 'No detailed description provided.'}
              </div>
            </div>

            {/* Timeline */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
              <div>
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Start Date</span>
                </span>
                <p className="mt-1 text-xs font-medium text-slate-200 tabular-nums">
                  {task.startDate ? new Date(task.startDate).toLocaleDateString() : 'Not set'}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Due Date</span>
                </span>
                <p
                  className={`mt-1 text-xs font-medium tabular-nums ${
                    isOverdue ? 'text-rose-400 font-semibold' : 'text-slate-200'
                  }`}
                >
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}
                </p>
              </div>
            </div>

            {/* Checklist */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-slate-400">
                  Subtask Checklist
                </label>
                {task.checklist.length > 0 && (
                  <span className="text-[11px] text-slate-400 tabular-nums">
                    {completedChecklistCount} of {task.checklist.length} done
                  </span>
                )}
              </div>

              {task.checklist.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No checklist items.</p>
              ) : (
                <div className="space-y-2">
                  {task.checklist.map(item => (
                    <div
                      key={item.id}
                      onClick={() => onToggleChecklist(task._id, item.id)}
                      className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 cursor-pointer hover:bg-slate-800/40 transition-colors"
                    >
                      {item.completed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span
                        className={`text-xs text-slate-200 truncate ${
                          item.completed ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  {task.tags.map(t => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-slate-800 text-slate-300 border border-slate-700/60"
                    >
                      <Tag className="w-3 h-3 text-violet-400" />
                      <span>{t}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
