import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { TaskModel, ProjectModel, ActivityModel, NotificationModel, ITask, TaskStatus, TaskPriority } from '../models/index.js';

export async function getTasks(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const userId = req.user._id;

    const {
      status,
      priority,
      projectId,
      search,
      overdue,
      sortBy = 'createdAt',
      order = 'desc',
      page = '1',
      limit = '100',
    } = req.query;

    let tasks = await TaskModel.find(task => task.owner === userId);

    // Filter by project
    if (projectId && typeof projectId === 'string') {
      tasks = tasks.filter(t => t.projectId === projectId);
    }

    // Filter by status
    if (status && typeof status === 'string') {
      tasks = tasks.filter(t => t.status === status);
    }

    // Filter by priority
    if (priority && typeof priority === 'string') {
      tasks = tasks.filter(t => t.priority === priority);
    }

    // Filter overdue
    if (overdue === 'true') {
      const now = new Date().toISOString();
      tasks = tasks.filter(t => t.dueDate && t.dueDate < now && t.status !== 'completed');
    }

    // Search
    if (search && typeof search === 'string') {
      const term = search.toLowerCase().trim();
      tasks = tasks.filter(t => {
        const titleMatch = t.title.toLowerCase().includes(term);
        const descMatch = t.description?.toLowerCase().includes(term);
        const tagsMatch = t.tags?.some(tag => tag.toLowerCase().includes(term));
        return titleMatch || descMatch || tagsMatch;
      });
    }

    // Sort
    const sortField = sortBy as string;
    const isAsc = order === 'asc';
    const priorityWeights: Record<TaskPriority, number> = {
      urgent: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    tasks.sort((a, b) => {
      if (sortField === 'priority') {
        const diff = priorityWeights[a.priority] - priorityWeights[b.priority];
        return isAsc ? diff : -diff;
      }
      if (sortField === 'dueDate') {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : isAsc ? Infinity : -Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : isAsc ? Infinity : -Infinity;
        return isAsc ? dateA - dateB : dateB - dateA;
      }
      if (sortField === 'title') {
        return isAsc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
      }
      // default: createdAt
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return isAsc ? timeA - timeB : timeB - timeA;
    });

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit as string, 10) || 50);
    const total = tasks.length;
    const paginated = tasks.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return res.json({
      success: true,
      tasks: paginated,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('getTasks error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve tasks' });
  }
}

export async function getTaskById(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { id } = req.params;

    const task = await TaskModel.findById(id);
    if (!task || task.owner !== req.user._id) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    let project = null;
    if (task.projectId) {
      project = await ProjectModel.findById(task.projectId);
    }

    return res.json({ success: true, task: { ...task, project } });
  } catch (error: any) {
    console.error('getTaskById error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve task' });
  }
}

export async function createTask(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const {
      title,
      description = '',
      status = 'todo',
      priority = 'medium',
      dueDate,
      startDate,
      checklist = [],
      tags = [],
      projectId,
    } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }

    const validStatuses: TaskStatus[] = ['todo', 'in_progress', 'in_review', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const validPriorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ success: false, message: 'Invalid priority' });
    }

    if (projectId) {
      const proj = await ProjectModel.findById(projectId);
      if (!proj || proj.owner !== req.user._id) {
        return res.status(400).json({ success: false, message: 'Associated project does not exist' });
      }
    }

    const task = await TaskModel.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      status,
      priority,
      startDate: startDate || undefined,
      dueDate: dueDate || undefined,
      checklist: Array.isArray(checklist) ? checklist : [],
      tags: Array.isArray(tags) ? tags.map((t: string) => t.trim()).filter(Boolean) : [],
      projectId: projectId || undefined,
      owner: req.user._id,
      completedAt: status === 'completed' ? new Date().toISOString() : undefined,
    });

    await ActivityModel.create({
      actor: req.user._id,
      actorName: req.user.name,
      action: `Created task "${task.title}"`,
      entityType: 'task',
      entityId: task._id,
    });

    return res.status(201).json({ success: true, message: 'Task created successfully', task });
  } catch (error: any) {
    console.error('createTask error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create task' });
  }
}

export async function updateTask(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { id } = req.params;

    const existing = await TaskModel.findById(id);
    if (!existing || existing.owner !== req.user._id) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const {
      title,
      description,
      status,
      priority,
      dueDate,
      startDate,
      checklist,
      tags,
      projectId,
    } = req.body;

    const updates: Partial<ITask> = {};

    if (title !== undefined) {
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Task title cannot be empty' });
      }
      updates.title = title.trim();
    }

    if (description !== undefined) updates.description = description;
    if (status !== undefined) {
      updates.status = status;
      if (status === 'completed' && existing.status !== 'completed') {
        updates.completedAt = new Date().toISOString();
      } else if (status !== 'completed' && existing.status === 'completed') {
        updates.completedAt = undefined;
      }
    }

    if (priority !== undefined) updates.priority = priority;
    if (dueDate !== undefined) updates.dueDate = dueDate || undefined;
    if (startDate !== undefined) updates.startDate = startDate || undefined;
    if (checklist !== undefined && Array.isArray(checklist)) updates.checklist = checklist;
    if (tags !== undefined && Array.isArray(tags)) updates.tags = tags;
    if (projectId !== undefined) updates.projectId = projectId || undefined;

    const updatedTask = await TaskModel.findByIdAndUpdate(id, updates);

    await ActivityModel.create({
      actor: req.user._id,
      actorName: req.user.name,
      action: `Updated task "${updatedTask?.title || existing.title}"`,
      entityType: 'task',
      entityId: id,
    });

    return res.json({ success: true, message: 'Task updated successfully', task: updatedTask });
  } catch (error: any) {
    console.error('updateTask error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update task' });
  }
}

export async function updateTaskStatus(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses: TaskStatus[] = ['todo', 'in_progress', 'in_review', 'completed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const existing = await TaskModel.findById(id);
    if (!existing || existing.owner !== req.user._id) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const updates: Partial<ITask> = { status };
    if (status === 'completed' && existing.status !== 'completed') {
      updates.completedAt = new Date().toISOString();
    } else if (status !== 'completed' && existing.status === 'completed') {
      updates.completedAt = undefined;
    }

    const updated = await TaskModel.findByIdAndUpdate(id, updates);

    await ActivityModel.create({
      actor: req.user._id,
      actorName: req.user.name,
      action: `Moved task "${existing.title}" to ${status.replace('_', ' ')}`,
      entityType: 'task',
      entityId: id,
    });

    return res.json({ success: true, message: 'Task status updated', task: updated });
  } catch (error: any) {
    console.error('updateTaskStatus error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update task status' });
  }
}

export async function deleteTask(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { id } = req.params;

    const existing = await TaskModel.findById(id);
    if (!existing || existing.owner !== req.user._id) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await TaskModel.findByIdAndDelete(id);

    await ActivityModel.create({
      actor: req.user._id,
      actorName: req.user.name,
      action: `Deleted task "${existing.title}"`,
      entityType: 'task',
      entityId: id,
    });

    return res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error: any) {
    console.error('deleteTask error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete task' });
  }
}
