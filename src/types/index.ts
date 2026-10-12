export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface IChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ITask {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate?: string;
  dueDate?: string;
  checklist: IChecklistItem[];
  tags: string[];
  projectId?: string;
  owner: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  project?: IProject;
}

export interface IProject {
  _id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  status: 'active' | 'planning' | 'completed' | 'on_hold';
  startDate?: string;
  dueDate?: string;
  owner: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
  completedTaskCount?: number;
  inProgressTaskCount?: number;
  progressPercentage?: number;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences?: {
    theme?: 'dark' | 'light';
    emailNotifications?: boolean;
    compactView?: boolean;
  };
  createdAt: string;
}

export interface INotification {
  _id: string;
  recipient: string;
  type: 'deadline_approaching' | 'task_overdue' | 'task_completed' | 'project_created' | 'system';
  title: string;
  message: string;
  readAt?: string;
  relatedTaskId?: string;
  relatedProjectId?: string;
  createdAt: string;
}

export interface IActivity {
  _id: string;
  actor: string;
  actorName: string;
  action: string;
  entityType: 'task' | 'project' | 'auth';
  entityId: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface IDashboardSummary {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number;
  todayAgenda: ITask[];
  upcomingDeadlines: ITask[];
  recentProjects: IProject[];
  recentActivities: IActivity[];
  priorityDistribution: Record<TaskPriority, number>;
  statusDistribution: Record<TaskStatus, number>;
}
