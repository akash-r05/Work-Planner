import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Kanban,
  FolderKanban,
  CalendarDays,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type NavigationTab =
  | 'dashboard'
  | 'tasks'
  | 'kanban'
  | 'projects'
  | 'calendar'
  | 'analytics'
  | 'notifications'
  | 'settings';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  unreadCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  unreadCount = 0,
}) => {
  const { user } = useAuth();

  const navItems = [
    { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks' as NavigationTab, label: 'Task List', icon: CheckSquare },
    { id: 'kanban' as NavigationTab, label: 'Kanban Board', icon: Kanban },
    { id: 'projects' as NavigationTab, label: 'Projects', icon: FolderKanban },
    { id: 'calendar' as NavigationTab, label: 'Calendar', icon: CalendarDays },
    { id: 'analytics' as NavigationTab, label: 'Analytics', icon: BarChart3 },
    {
      id: 'notifications' as NavigationTab,
      label: 'Notifications',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { id: 'settings' as NavigationTab, label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-800/80 bg-[#0E1424] transition-all duration-300 ease-in-out shrink-0 select-none z-30 ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 shadow-md shadow-violet-500/20 shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold tracking-tight text-slate-100 truncate">
                Work Planner
              </span>
              <span className="text-[11px] text-slate-400 truncate">Spatial Workspace</span>
            </div>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors hidden md:flex items-center justify-center"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600/20 to-cyan-500/10 text-violet-300 border border-violet-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-violet-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
              {item.badge !== undefined && (
                <span
                  className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums ${
                    isActive
                      ? 'bg-violet-500 text-white'
                      : 'bg-violet-950 text-violet-300 border border-violet-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Status Bar */}
      <div className="p-3 border-t border-slate-800/80">
        <div
          onClick={() => onSelectTab('settings')}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/40 cursor-pointer transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-xs font-semibold text-violet-300 shrink-0">
            {user?.name
              ? user.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase()
              : 'U'}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="text-xs font-medium text-slate-200 truncate">{user?.name}</span>
              <span className="text-[11px] text-slate-400 truncate">{user?.email}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
