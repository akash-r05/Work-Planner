import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Calendar,
  AlertTriangle,
  FolderKanban,
  Edit2,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { ITask, IProject, TaskStatus, TaskPriority } from '../../types';

interface TaskListViewProps {
  tasks: ITask[];
  projects: IProject[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleComplete: (task: ITask) => void;
  onOpenTaskDetails: (task: ITask) => void;
  onEditTask: (task: ITask) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenNewTaskModal: (defaultStatus?: TaskStatus) => void;
  onQuickCreateTask: (title: string) => Promise<void>;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  projects,
  searchQuery,
  onSearchChange,
  onToggleComplete,
  onOpenTaskDetails,
  onEditTask,
  onDeleteTask,
  onOpenNewTaskModal,
  onQuickCreateTask,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt' | 'title'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickSubmitting, setQuickSubmitting] = useState(false);

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchTag = task.tags?.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTag) return false;
    }

    // Status
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;

    // Priority
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

    // Project
    if (projectFilter !== 'all' && task.projectId !== projectFilter) return false;

    return true;
  });

  // Sort tasks
  const priorityWeights: Record<TaskPriority, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const isAsc = sortOrder === 'asc';
    if (sortBy === 'priority') {
      const diff = priorityWeights[a.priority] - priorityWeights[b.priority];
      return isAsc ? diff : -diff;
    }
    if (sortBy === 'dueDate') {
      const timeA = a.dueDate ? new Date(a.dueDate).getTime() : isAsc ? Infinity : -Infinity;
      const timeB = b.dueDate ? new Date(b.dueDate).getTime() : isAsc ? Infinity : -Infinity;
      return isAsc ? timeA - timeB : timeB - timeA;
    }
    if (sortBy === 'title') {
      return isAsc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
    }
    // createdAt
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return isAsc ? timeA - timeB : timeB - timeA;
  });

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    setQuickSubmitting(true);
    try {
      await onQuickCreateTask(quickTitle.trim());
      setQuickTitle('');
    } finally {
      setQuickSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Task Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize, triage, and track operational deliverables across all active projects.
          </p>
        </div>

        <button
          onClick={() => onOpenNewTaskModal('todo')}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-violet-500/20 active:scale-95 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Task</span>
        </button>
      </div>

      {/* Quick Add Bar */}
      <form onSubmit={handleQuickSubmit} className="flex gap-2">
        <input
          type="text"
          value={quickTitle}
          onChange={e => setQuickTitle(e.target.value)}
          placeholder="Quick add a task and press Enter... (e.g. Schedule team sync for sprint kick-off)"
          className="flex-1 px-4 py-2.5 text-xs bg-[#141B2D] border border-slate-800 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:border-violet-500/60 transition-colors shadow-sm"
        />
        <button
          type="submit"
          disabled={quickSubmitting || !quickTitle.trim()}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </form>

      {/* Filter and Sort Bar */}
      <div className="p-3 rounded-2xl bg-[#141B2D]/80 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Status segmented filters */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/80 rounded-xl overflow-x-auto max-w-full">
          {[
            { id: 'all', label: 'All Tasks' },
            { id: 'todo', label: 'To Do' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'in_review', label: 'In Review' },
            { id: 'completed', label: 'Completed' },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === s.id
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Secondary dropdown filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Project Filter */}
          <select
            value={projectFilter}
            onChange={e => setProjectFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1">
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-300 text-xs focus:outline-none"
            >
              <option value="createdAt">Date Created</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
              className="text-slate-400 hover:text-slate-200 text-xs px-1"
              title="Toggle sort direction"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Task List Items */}
      {sortedTasks.length === 0 ? (
        <div className="py-16 px-4 text-center rounded-2xl border border-slate-800/80 bg-[#141B2D]/40">
          <CheckCircle2 className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">No matching tasks found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria, clearing active filters, or creating a new task.
          </p>
          <button
            onClick={() => {
              setStatusFilter('all');
              setPriorityFilter('all');
              setProjectFilter('all');
              onSearchChange('');
            }}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-lg transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedTasks.map(task => {
            const project = projects.find(p => p._id === task.projectId);
            const isCompleted = task.status === 'completed';
            const isOverdue =
              task.dueDate &&
              new Date(task.dueDate).getTime() < Date.now() &&
              !isCompleted;

            const checklistDone = task.checklist.filter(c => c.completed).length;

            return (
              <div
                key={task._id}
                className={`group flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 ${
                  isCompleted
                    ? 'bg-[#141B2D]/40 border-slate-800/50 opacity-75'
                    : 'bg-[#141B2D] border-slate-800 hover:border-violet-500/40 hover:shadow-md'
                }`}
              >
                {/* Left: Complete toggle & title */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => onToggleComplete(task)}
                    className="text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                    title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {isCompleted ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 hover:text-violet-400" />
                    )}
                  </button>

                  <div
                    onClick={() => onOpenTaskDetails(task)}
                    className="flex flex-col min-w-0 cursor-pointer flex-1"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold truncate ${
                          isCompleted ? 'line-through text-slate-400' : 'text-slate-100'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>

                    {/* Unboxed Metadata with Typographic Separator Discipline */}
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 flex-wrap">
                      {project && (
                        <>
                          <span
                            className="font-medium"
                            style={{ color: project.color || '#8B5CF6' }}
                          >
                            {project.name}
                          </span>
                          <span aria-hidden="true">·</span>
                        </>
                      )}

                      <span
                        className={`font-medium ${
                          task.priority === 'urgent'
                            ? 'text-rose-400'
                            : task.priority === 'high'
                            ? 'text-amber-400'
                            : task.priority === 'medium'
                            ? 'text-cyan-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {task.priority.toUpperCase()}
                      </span>

                      {task.dueDate && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span
                            className={`flex items-center gap-1 tabular-nums ${
                              isOverdue ? 'text-rose-400 font-semibold' : ''
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            <span>
                              {isOverdue ? 'Overdue: ' : 'Due '}
                              {new Date(task.dueDate).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </span>
                        </>
                      )}

                      {task.checklist.length > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">
                            {checklistDone}/{task.checklist.length} checklist
                          </span>
                        </>
                      )}

                      {task.tags && task.tags.length > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{task.tags.join(', ')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-3 shrink-0">
                  <button
                    onClick={() => onEditTask(task)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    title="Edit task"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteTask(task._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
