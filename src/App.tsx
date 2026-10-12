import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Sidebar, NavigationTab } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { LandingPage } from './features/landing/LandingPage';
import { AuthModal } from './features/auth/AuthModal';
import { DashboardView } from './features/dashboard/DashboardView';
import { TaskListView } from './features/tasks/TaskListView';
import { TaskFormModal } from './features/tasks/TaskFormModal';
import { TaskDetailDrawer } from './features/tasks/TaskDetailDrawer';
import { KanbanBoardView } from './features/kanban/KanbanBoardView';
import { ProjectsView } from './features/projects/ProjectsView';
import { ProjectFormModal } from './features/projects/ProjectFormModal';
import { CalendarView } from './features/calendar/CalendarView';
import { AnalyticsView } from './features/analytics/AnalyticsView';
import { NotificationsView } from './features/notifications/NotificationsView';
import { SettingsView } from './features/settings/SettingsView';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import { api } from './services/api';
import {
  ITask,
  IProject,
  INotification,
  IActivity,
  IDashboardSummary,
  TaskStatus,
} from './types';

function MainApp() {
  const { user, loading, loginAsDemo } = useAuth();
  const { showToast } = useToast();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Landing & Auth modal states
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');

  // Core Data States
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [projects, setProjects] = useState<IProject[]>([]);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [activities, setActivities] = useState<IActivity[]>([]);
  const [dashboardSummary, setDashboardSummary] = useState<IDashboardSummary | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  // Modals & Drawers States
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ITask | null>(null);
  const [selectedTaskDetails, setSelectedTaskDetails] = useState<ITask | null>(null);
  const [defaultTaskStatus, setDefaultTaskStatus] = useState<TaskStatus>('todo');

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<IProject | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'task' | 'project';
    id: string;
    isOpen: boolean;
  }>({ type: 'task', id: '', isOpen: false });

  // Data loader
  const loadWorkspaceData = useCallback(async () => {
    if (!user) return;
    try {
      setDataLoading(true);
      const [tasksRes, projectsRes, notifsRes, activitiesRes, summaryRes] =
        await Promise.all([
          api.getTasks({ limit: 200 }),
          api.getProjects(),
          api.getNotifications(),
          api.getActivities(),
          api.getDashboardSummary(),
        ]);

      if (tasksRes.success) setTasks(tasksRes.tasks);
      if (projectsRes.success) setProjects(projectsRes.projects);
      if (notifsRes.success) setNotifications(notifsRes.notifications);
      if (activitiesRes.success) setActivities(activitiesRes.activities);
      if (summaryRes.success) setDashboardSummary(summaryRes.summary);
    } catch (err: any) {
      console.error('Failed to load workspace data:', err);
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadWorkspaceData();
    }
  }, [user, loadWorkspaceData]);

  // Task actions
  const handleCreateOrUpdateTask = async (taskData: Partial<ITask>) => {
    try {
      if (editingTask) {
        const res = await api.updateTask(editingTask._id, taskData);
        if (res.success) {
          showToast('Task updated successfully', 'success');
          if (selectedTaskDetails?._id === editingTask._id) {
            setSelectedTaskDetails(res.task);
          }
        }
      } else {
        const res = await api.createTask(taskData);
        if (res.success) {
          showToast('Task created successfully', 'success');
        }
      }
      loadWorkspaceData();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
      throw err;
    }
  };

  const handleQuickCreateTask = async (title: string) => {
    try {
      const res = await api.createTask({
        title,
        status: 'todo',
        priority: 'medium',
        projectId: projects[0]?._id,
      });
      if (res.success) {
        showToast('Task added to agenda', 'success');
        loadWorkspaceData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to create task', 'error');
    }
  };

  const handleToggleComplete = async (task: ITask) => {
    const nextStatus: TaskStatus = task.status === 'completed' ? 'todo' : 'completed';
    try {
      // Optimistic update
      setTasks(prev =>
        prev.map(t =>
          t._id === task._id
            ? { ...t, status: nextStatus, completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined }
            : t
        )
      );

      await api.updateTaskStatus(task._id, nextStatus);
      showToast(
        nextStatus === 'completed' ? 'Task completed! Great progress.' : 'Task reopened',
        'success'
      );
      loadWorkspaceData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
      loadWorkspaceData();
    }
  };

  const handleUpdateStatus = async (taskId: string, status: TaskStatus) => {
    try {
      // Optimistic update
      setTasks(prev =>
        prev.map(t => (t._id === taskId ? { ...t, status } : t))
      );
      await api.updateTaskStatus(taskId, status);
      loadWorkspaceData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
      loadWorkspaceData();
    }
  };

  const handleToggleChecklist = async (taskId: string, checklistId: string) => {
    const targetTask = tasks.find(t => t._id === taskId);
    if (!targetTask) return;

    const updatedChecklist = targetTask.checklist.map(item =>
      item.id === checklistId ? { ...item, completed: !item.completed } : item
    );

    try {
      const res = await api.updateTask(taskId, { checklist: updatedChecklist });
      if (res.success) {
        if (selectedTaskDetails?._id === taskId) {
          setSelectedTaskDetails(res.task);
        }
        loadWorkspaceData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update checklist item', 'error');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      showToast('Task removed permanently', 'info');
      if (selectedTaskDetails?._id === taskId) {
        setSelectedTaskDetails(null);
      }
      loadWorkspaceData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete task', 'error');
    }
  };

  // Project actions
  const handleCreateOrUpdateProject = async (projectData: Partial<IProject>) => {
    try {
      if (editingProject) {
        const res = await api.updateProject(editingProject._id, projectData);
        if (res.success) {
          showToast('Project updated successfully', 'success');
        }
      } else {
        const res = await api.createProject(projectData);
        if (res.success) {
          showToast('Project created successfully', 'success');
        }
      }
      loadWorkspaceData();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
      throw err;
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await api.deleteProject(projectId);
      showToast('Project deleted successfully', 'info');
      loadWorkspaceData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete project', 'error');
    }
  };

  const handleArchiveProject = async (projectId: string, isArchived: boolean) => {
    try {
      await api.updateProject(projectId, { isArchived } as any);
      showToast(isArchived ? 'Project archived' : 'Project unarchived', 'info');
      loadWorkspaceData();
    } catch (err: any) {
      showToast(err.message || 'Failed to archive project', 'error');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1020] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          <span className="text-xs text-slate-400 font-medium tracking-wide">
            Initializing Work Planner...
          </span>
        </div>
      </div>
    );
  }

  // Unauthenticated: Show Landing Page
  if (!user) {
    return (
      <>
        <LandingPage
          onOpenAuth={mode => {
            setAuthInitialMode(mode);
            setAuthModalOpen(true);
          }}
          onLaunchDemo={async () => {
            await loginAsDemo();
          }}
        />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authInitialMode}
        />
      </>
    );
  }

  // Authenticated App Shell
  const pageTitles: Record<NavigationTab, string> = {
    dashboard: 'Workspace Dashboard',
    tasks: 'Task Management',
    kanban: 'Kanban Workflow',
    projects: 'Projects & Scope',
    calendar: 'Timeline & Schedule',
    analytics: 'Performance Analytics',
    notifications: 'Notifications & Alerts',
    settings: 'Workspace Settings',
  };

  return (
    <div className="min-h-screen bg-[#0B1020] text-slate-100 flex flex-col font-sans selection:bg-violet-500/30 selection:text-violet-200">
      <div className="flex-1 flex overflow-hidden">
        {/* Spatial Collapsible Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={tab => {
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          unreadCount={notifications.filter(n => !n.readAt).length}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Bar */}
          <Topbar
            title={pageTitles[currentTab]}
            onOpenNewTaskModal={() => {
              setEditingTask(null);
              setDefaultTaskStatus('todo');
              setTaskModalOpen(true);
            }}
            onNavigateTab={tab => setCurrentTab(tab)}
            notifications={notifications}
            onRefreshNotifications={loadWorkspaceData}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Tab Viewport */}
          <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardView
                summary={dashboardSummary}
                projects={projects}
                onOpenNewTaskModal={() => {
                  setEditingTask(null);
                  setDefaultTaskStatus('todo');
                  setTaskModalOpen(true);
                }}
                onNavigateTab={tab => setCurrentTab(tab)}
                onOpenTaskDetails={t => setSelectedTaskDetails(t)}
                onToggleCompleteTask={handleToggleComplete}
              />
            )}

            {currentTab === 'tasks' && (
              <TaskListView
                tasks={tasks}
                projects={projects}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onToggleComplete={handleToggleComplete}
                onOpenTaskDetails={t => setSelectedTaskDetails(t)}
                onEditTask={t => {
                  setEditingTask(t);
                  setTaskModalOpen(true);
                }}
                onDeleteTask={id => setDeleteConfirm({ type: 'task', id, isOpen: true })}
                onOpenNewTaskModal={status => {
                  setEditingTask(null);
                  setDefaultTaskStatus(status || 'todo');
                  setTaskModalOpen(true);
                }}
                onQuickCreateTask={handleQuickCreateTask}
              />
            )}

            {currentTab === 'kanban' && (
              <KanbanBoardView
                tasks={tasks}
                projects={projects}
                onUpdateStatus={handleUpdateStatus}
                onOpenTaskDetails={t => setSelectedTaskDetails(t)}
                onOpenNewTaskModal={status => {
                  setEditingTask(null);
                  setDefaultTaskStatus(status || 'todo');
                  setTaskModalOpen(true);
                }}
              />
            )}

            {currentTab === 'projects' && (
              <ProjectsView
                projects={projects}
                tasks={tasks}
                onOpenNewProjectModal={() => {
                  setEditingProject(null);
                  setProjectModalOpen(true);
                }}
                onEditProject={p => {
                  setEditingProject(p);
                  setProjectModalOpen(true);
                }}
                onDeleteProject={id => setDeleteConfirm({ type: 'project', id, isOpen: true })}
                onArchiveProject={handleArchiveProject}
                onSelectProjectForFilter={projectId => {
                  setCurrentTab('tasks');
                }}
              />
            )}

            {currentTab === 'calendar' && (
              <CalendarView
                tasks={tasks}
                projects={projects}
                onOpenTaskDetails={t => setSelectedTaskDetails(t)}
                onOpenNewTaskModalWithDate={dateStr => {
                  setEditingTask(null);
                  setDefaultTaskStatus('todo');
                  setTaskModalOpen(true);
                }}
              />
            )}

            {currentTab === 'analytics' && <AnalyticsView />}

            {currentTab === 'notifications' && (
              <NotificationsView
                notifications={notifications}
                activities={activities}
                onRefreshNotifications={loadWorkspaceData}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsView onRefreshAllData={loadWorkspaceData} />
            )}
          </main>
        </div>
      </div>

      {/* Task Creation & Edit Modal */}
      <TaskFormModal
        isOpen={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleCreateOrUpdateTask}
        initialTask={editingTask}
        projects={projects}
        defaultStatus={defaultTaskStatus}
      />

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        isOpen={Boolean(selectedTaskDetails)}
        onClose={() => setSelectedTaskDetails(null)}
        task={selectedTaskDetails}
        onEdit={t => {
          setSelectedTaskDetails(null);
          setEditingTask(t);
          setTaskModalOpen(true);
        }}
        onDelete={id => {
          setSelectedTaskDetails(null);
          setDeleteConfirm({ type: 'task', id, isOpen: true });
        }}
        onToggleChecklist={handleToggleChecklist}
        onStatusChange={(taskId, status) => {
          handleUpdateStatus(taskId, status);
          if (selectedTaskDetails) {
            setSelectedTaskDetails(prev => (prev ? { ...prev, status } : null));
          }
        }}
        projects={projects}
      />

      {/* Project Form Modal */}
      <ProjectFormModal
        isOpen={projectModalOpen}
        onClose={() => {
          setProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleCreateOrUpdateProject}
        initialProject={editingProject}
      />

      {/* Reusable Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          if (deleteConfirm.type === 'task') {
            handleDeleteTask(deleteConfirm.id);
          } else {
            handleDeleteProject(deleteConfirm.id);
          }
        }}
        title={`Delete ${deleteConfirm.type === 'task' ? 'Task' : 'Project'}?`}
        message={`Are you sure you want to permanently delete this ${deleteConfirm.type}? This action cannot be undone.`}
        confirmLabel="Delete Permanently"
        isDestructive
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
