export interface IUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  preferences?: {
    theme?: 'dark' | 'light';
    emailNotifications?: boolean;
    compactView?: boolean;
  };
  resetPasswordToken?: string;
  resetPasswordExpires?: string;
  createdAt: string;
  updatedAt: string;
}

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
  owner: string; // User ID
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
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
  owner: string; // User ID
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface INotification {
  _id: string;
  recipient: string; // User ID
  type: 'deadline_approaching' | 'task_overdue' | 'task_completed' | 'project_created' | 'system';
  title: string;
  message: string;
  readAt?: string;
  relatedTaskId?: string;
  relatedProjectId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IActivity {
  _id: string;
  actor: string; // User ID
  actorName: string;
  action: string;
  entityType: 'task' | 'project' | 'auth';
  entityId: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}
