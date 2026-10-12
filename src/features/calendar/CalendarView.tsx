import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { ITask, IProject } from '../../types';

interface CalendarViewProps {
  tasks: ITask[];
  projects: IProject[];
  onOpenTaskDetails: (task: ITask) => void;
  onOpenNewTaskModalWithDate: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  projects,
  onOpenTaskDetails,
  onOpenNewTaskModalWithDate,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Days in month calculation
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  // Build grid days
  const calendarCells = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dayNum = prevMonthDays - i;
    calendarCells.push({
      dayNum,
      isCurrentMonth: false,
      dateStr: `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarCells.push({
      dayNum: i,
      isCurrentMonth: true,
      dateStr,
    });
  }

  // Next month leading days
  const remainingCells = 35 - calendarCells.length;
  if (remainingCells > 0) {
    for (let i = 1; i <= remainingCells; i++) {
      const dateStr = `${year}-${String(month + 2).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      calendarCells.push({
        dayNum: i,
        isCurrentMonth: false,
        dateStr,
      });
    }
  }

  const selectedDateTasks = tasks.filter(t => t.dueDate && t.dueDate.startsWith(selectedDate));
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Timeline & Calendar</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Schedule deadlines, inspect workload distribution, and plan delivery agendas.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg transition-colors"
          >
            Today
          </button>
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded text-slate-400 hover:text-slate-200 transition-colors"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold px-3 text-slate-200 tabular-nums">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded text-slate-400 hover:text-slate-200 transition-colors"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Main Calendar Grid */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-800/80 bg-[#141B2D] p-4 shadow-xl">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 pb-3 border-b border-slate-800/80 mb-2">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarCells.map((cell, idx) => {
              const dayTasks = tasks.filter(t => t.dueDate && t.dueDate.startsWith(cell.dateStr));
              const isToday = cell.dateStr === todayStr;
              const isSelected = cell.dateStr === selectedDate;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={`min-h-[92px] p-2 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer group ${
                    isSelected
                      ? 'border-violet-500 bg-violet-950/20'
                      : isToday
                      ? 'border-cyan-500/50 bg-slate-900/60'
                      : cell.isCurrentMonth
                      ? 'border-slate-800/60 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-900/60'
                      : 'border-transparent bg-transparent opacity-30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-medium tabular-nums ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-bold flex items-center justify-center'
                          : isSelected
                          ? 'text-violet-300 font-bold'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {/* Quick Add on hover */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onOpenNewTaskModalWithDate(cell.dateStr);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-400 hover:text-white transition-opacity"
                      title="Add task on this date"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Tasks on this day */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayTasks.slice(0, 2).map(task => {
                      const isDone = task.status === 'completed';
                      return (
                        <div
                          key={task._id}
                          onClick={e => {
                            e.stopPropagation();
                            onOpenTaskDetails(task);
                          }}
                          className={`truncate text-[10px] px-1.5 py-0.5 rounded font-medium cursor-pointer transition-colors ${
                            isDone
                              ? 'bg-emerald-950/40 text-emerald-300 line-through opacity-75'
                              : task.priority === 'urgent'
                              ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                              : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                          }`}
                        >
                          {task.title}
                        </div>
                      );
                    })}
                    {dayTasks.length > 2 && (
                      <span className="text-[10px] text-violet-400 font-semibold block px-1">
                        +{dayTasks.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Agenda Panel */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#141B2D] p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Agenda for Date
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 tabular-nums">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>

            <button
              onClick={() => onOpenNewTaskModalWithDate(selectedDate)}
              className="p-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors"
              title="Add task on selected date"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {selectedDateTasks.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              <CalendarIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <span>No deliverables scheduled for this day.</span>
              <button
                onClick={() => onOpenNewTaskModalWithDate(selectedDate)}
                className="mt-3 block mx-auto text-[11px] text-violet-400 hover:text-violet-300 font-medium"
              >
                + Schedule a task
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {selectedDateTasks.map(task => {
                const project = projects.find(p => p._id === task.projectId);
                return (
                  <div
                    key={task._id}
                    onClick={() => onOpenTaskDetails(task)}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-violet-500/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      {project ? (
                        <span
                          className="text-[10px] font-semibold truncate"
                          style={{ color: project.color || '#8B5CF6' }}
                        >
                          {project.name}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">General</span>
                      )}

                      <span
                        className={`text-[9px] font-bold px-1 rounded uppercase ${
                          task.priority === 'urgent'
                            ? 'text-rose-400 bg-rose-950/60'
                            : task.priority === 'high'
                            ? 'text-amber-400 bg-amber-950/60'
                            : 'text-slate-400 bg-slate-800'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <p
                      className={`text-xs font-medium ${
                        task.status === 'completed'
                          ? 'line-through text-slate-400'
                          : 'text-slate-200'
                      }`}
                    >
                      {task.title}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
