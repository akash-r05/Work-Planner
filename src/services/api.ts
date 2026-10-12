import { ITask, IProject, IUser, INotification, IActivity, IDashboardSummary, TaskStatus } from '../types';

const API_BASE = '/api/v1';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('wp_auth_token');
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('wp_auth_token', token);
    } else {
      localStorage.removeItem('wp_auth_token');
    }
  }

  public getToken() {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include', // Includes HTTP-only cookies
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  }

  // Auth APIs
  async register(name: string, email: string, password: string) {
    const res = await this.request<{ success: boolean; user: IUser; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    this.setToken(res.token);
    return res;
  }

  async login(email: string, password: string) {
    const res = await this.request<{ success: boolean; user: IUser; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.token);
    return res;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async getMe() {
    return this.request<{ success: boolean; user: IUser }>('/auth/me');
  }

  async forgotPassword(email: string) {
    return this.request<{ success: boolean; message: string; resetToken?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request<{ success: boolean; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async updateProfile(updates: {
    name?: string;
    avatar?: string;
    preferences?: any;
    currentPassword?: string;
    newPassword?: string;
  }) {
    return this.request<{ success: boolean; user: IUser; message: string }>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteAccount() {
    const res = await this.request<{ success: boolean; message: string }>('/auth/account', {
      method: 'DELETE',
    });
    this.setToken(null);
    return res;
  }

  // Tasks APIs
  async getTasks(params: {
    status?: string;
    priority?: string;
    projectId?: string;
    search?: string;
    overdue?: boolean;
    sortBy?: string;
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  } = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.priority && params.priority !== 'all') query.set('priority', params.priority);
    if (params.projectId && params.projectId !== 'all') query.set('projectId', params.projectId);
    if (params.search) query.set('search', params.search);
    if (params.overdue) query.set('overdue', 'true');
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.order) query.set('order', params.order);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<{
      success: boolean;
      tasks: ITask[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/tasks${qs}`);
  }

  async getTask(id: string) {
    return this.request<{ success: boolean; task: ITask }>(`/tasks/${id}`);
  }

  async createTask(task: Partial<ITask>) {
    return this.request<{ success: boolean; task: ITask; message: string }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(id: string, updates: Partial<ITask>) {
    return this.request<{ success: boolean; task: ITask; message: string }>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async updateTaskStatus(id: string, status: TaskStatus) {
    return this.request<{ success: boolean; task: ITask; message: string }>(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deleteTask(id: string) {
    return this.request<{ success: boolean; message: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Projects APIs
  async getProjects(params: { status?: string; search?: string; includeArchived?: boolean } = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    if (params.includeArchived) query.set('includeArchived', 'true');

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ success: boolean; projects: IProject[] }>(`/projects${qs}`);
  }

  async getProject(id: string) {
    return this.request<{ success: boolean; project: IProject & { tasks: ITask[] } }>(`/projects/${id}`);
  }

  async createProject(project: Partial<IProject>) {
    return this.request<{ success: boolean; project: IProject; message: string }>('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async updateProject(id: string, updates: Partial<IProject>) {
    return this.request<{ success: boolean; project: IProject; message: string }>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteProject(id: string) {
    return this.request<{ success: boolean; message: string }>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Dashboard & Analytics
  async getDashboardSummary() {
    return this.request<{ success: boolean; summary: IDashboardSummary }>('/dashboard/summary');
  }

  async getProductivityAnalytics() {
    return this.request<{
      success: boolean;
      weeklyTrend: { date: string; day: string; completed: number; created: number }[];
      totalCompleted: number;
      totalTasks: number;
      completionRate: number;
    }>('/dashboard/analytics/productivity');
  }

  async getTaskAnalytics() {
    return this.request<{
      success: boolean;
      statusData: { name: string; value: number; color: string }[];
      priorityData: { name: string; count: number; fill: string }[];
      projectBreakdown: { id: string; name: string; color: string; total: number; completed: number; inProgress: number }[];
    }>('/dashboard/analytics/tasks');
  }

  // Notifications & Activities
  async getNotifications() {
    return this.request<{ success: boolean; notifications: INotification[]; unreadCount: number }>('/notifications');
  }

  async markNotificationRead(id: string) {
    return this.request<{ success: boolean; notification: INotification }>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsRead() {
    return this.request<{ success: boolean; message: string }>('/notifications/read-all', {
      method: 'PATCH',
    });
  }

  async getActivities() {
    return this.request<{ success: boolean; activities: IActivity[] }>('/notifications/activities/list');
  }

  // Demo Reseed
  async reseedData(force = true) {
    return this.request<{ success: boolean; message: string }>(`/seed?force=${force}`, {
      method: 'POST',
    });
  }
}

export const api = new ApiClient();
