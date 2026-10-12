import React, { useState } from 'react';
import {
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FolderKanban,
  CheckSquare,
  MoreHorizontal,
  MoveRight,
  MoveLeft,
} from 'lucide-react';
import { ITask, IProject, TaskStatus } from '../../types';
import { SpatialCard } from '../../components/effects/SpatialCard';

interface KanbanBoardViewProps {
  tasks: ITask[];
  projects: IProject[];
  onUpdateStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  onOpenTaskDetails: (task: ITask) => void;
  onOpenNewTaskModal: (defaultStatus?: TaskStatus) => void;
}

interface ColumnConfig {
  id: TaskStatus;
  title: string;
  color: string;
  accentBorder: string;
}

const COLUMNS: ColumnConfig[] = [
  { id: 'todo', title: 'To Do', color: 'text-slate-300', accentBorder: 'border-slate-700' },
  { id: 'in_progress', title: 'In Progress', color: 'text-cyan-400', accentBorder: 'border-cyan-500/40' },
  { id: 'in_review', title: 'In Review', color: 'text-purple-400', accentBorder: 'border-purple-500/40' },
  { id: 'completed', title: 'Completed', color: 'text-emerald-400', accentBorder: 'border-emerald-500/40' },
];

export const KanbanBoardView: React.FC<KanbanBoardViewProps> = ({
  tasks,
  projects,
  onUpdateStatus,
  onOpenTaskDetails,
  onOpenNewTaskModal,
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(colId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDragOverColumn(null);
    setDraggedTaskId(null);

    if (taskId) {
      await onUpdateStatus(taskId, targetStatus);
    }
  };

  // Keyboard / accessible move helper
  const handleQuickMove = async (task: ITask, direction: 'next' | 'prev') => {
    const statuses: TaskStatus[] = ['todo', 'in_progress', 'in_review', 'completed'];
    const currentIndex = statuses.indexOf(task.status);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (nextIndex >= 0 && nextIndex < statuses.length) {
      await onUpdateStatus(task._id, statuses[nextIndex]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Kanban Workspace</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Drag cards between status stages or use arrow shortcuts to advance work items.
          </p>
        </div>

        <button
          onClick={() => onOpenNewTaskModal('todo')}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-violet-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Card</span>
        </button>
      </div>

      {/* 4 Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start pb-6">
        {COLUMNS.map(col => {
          const columnTasks = tasks.filter(t => t.status === col.id);
          const isDraggingOver = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={e => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, col.id)}
              className={`flex flex-col rounded-2xl bg-[#0E1424]/90 border transition-all duration-200 min-h-[500px] p-3.5 ${
                isDraggingOver
                  ? 'border-violet-500 bg-violet-950/20 shadow-lg'
                  : 'border-slate-800/80'
              }`}
            >
              {/* Column Title Strip */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <h3 className={`text-xs font-bold tracking-wide uppercase ${col.color}`}>
                    {col.title}
                  </h3>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 tabular-nums">
                    {columnTasks.length}
                  </span>
                </div>

                <button
                  onClick={() => onOpenNewTaskModal(col.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
                  title={`Add task to ${col.title}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Column Cards Container */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
                {columnTasks.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800/60 text-slate-400 text-xs">
                    <span>No cards in {col.title}</span>
                    <button
                      onClick={() => onOpenNewTaskModal(col.id)}
                      className="mt-2 text-[11px] text-violet-400 hover:text-violet-300"
                    >
                      + Add task
                    </button>
                  </div>
                ) : (
                  columnTasks.map(task => {
                    const project = projects.find(p => p._id === task.projectId);
                    const isOverdue =
                      task.dueDate &&
                      new Date(task.dueDate).getTime() < Date.now() &&
                      task.status !== 'completed';
                    const checklistDone = task.checklist.filter(c => c.completed).length;

                    return (
                      <div
                        key={task._id}
                        draggable
                        onDragStart={e => handleDragStart(e, task._id)}
                        className="group relative cursor-grab active:cursor-grabbing"
                      >
                        <SpatialCard
                          className="p-3.5 border-slate-800 bg-[#141B2D] hover:border-violet-500/40"
                          tiltIntensity={4}
                          onClick={() => onOpenTaskDetails(task)}
                        >
                          {/* Project Tag & Priority */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            {project ? (
                              <span
                                className="text-[11px] font-semibold truncate"
                                style={{ color: project.color || '#8B5CF6' }}
                              >
                                {project.name}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400">General</span>
                            )}

                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                task.priority === 'urgent'
                                  ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                                  : task.priority === 'high'
                                  ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                                  : task.priority === 'medium'
                                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {task.priority.toUpperCase()}
                            </span>
                          </div>

                          {/* Task Title */}
                          <h4 className="text-xs font-semibold text-slate-100 line-clamp-2 leading-relaxed">
                            {task.title}
                          </h4>

                          {/* Metadata row */}
                          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                            {task.dueDate ? (
                              <span
                                className={`flex items-center gap-1 tabular-nums ${
                                  isOverdue ? 'text-rose-400 font-semibold' : ''
                                }`}
                              >
                                <Calendar className="w-3 h-3" />
                                <span>
                                  {new Date(task.dueDate).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              </span>
                            ) : (
                              <span className="text-slate-400">No due date</span>
                            )}

                            {task.checklist.length > 0 && (
                              <span className="flex items-center gap-1 tabular-nums">
                                <CheckSquare className="w-3 h-3 text-violet-400" />
                                <span>
                                  {checklistDone}/{task.checklist.length}
                                </span>
                              </span>
                            )}
                          </div>

                          {/* Quick Accessibility Move Buttons (Hidden until card hover) */}
                          <div
                            onClick={e => e.stopPropagation()}
                            className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <button
                              disabled={col.id === 'todo'}
                              onClick={() => handleQuickMove(task, 'prev')}
                              className="text-[10px] text-slate-400 hover:text-white disabled:opacity-30 flex items-center gap-0.5"
                              title="Move left"
                            >
                              <MoveLeft className="w-3 h-3" />
                              <span>Prev</span>
                            </button>

                            <button
                              disabled={col.id === 'completed'}
                              onClick={() => handleQuickMove(task, 'next')}
                              className="text-[10px] text-slate-400 hover:text-white disabled:opacity-30 flex items-center gap-0.5"
                              title="Move right"
                            >
                              <span>Next</span>
                              <MoveRight className="w-3 h-3" />
                            </button>
                          </div>
                        </SpatialCard>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick Add Card Button at Column Bottom */}
              <button
                onClick={() => onOpenNewTaskModal(col.id)}
                className="mt-3 py-2 px-3 rounded-xl border border-dashed border-slate-800 hover:border-violet-500/40 text-slate-400 hover:text-violet-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors bg-slate-900/40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
