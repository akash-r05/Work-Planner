import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { ProjectModel, TaskModel, ActivityModel, IProject } from '../models/index.js';

export async function getProjects(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const userId = req.user._id;

    const { status, search, includeArchived } = req.query;

    let projects = await ProjectModel.find(p => p.owner === userId);

    if (includeArchived !== 'true') {
      projects = projects.filter(p => !p.archivedAt);
    }

    if (status && typeof status === 'string') {
      projects = projects.filter(p => p.status === status);
    }

    if (search && typeof search === 'string') {
      const term = search.toLowerCase().trim();
      projects = projects.filter(p => p.name.toLowerCase().includes(term) || p.description?.toLowerCase().includes(term));
    }

    // Compute live task counts and completion rate for each project
    const allUserTasks = await TaskModel.find(t => t.owner === userId);

    const enrichedProjects = projects.map(project => {
      const projectTasks = allUserTasks.filter(t => t.projectId === project._id);
      const totalTasks = projectTasks.length;
      const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
      const inProgressTasks = projectTasks.filter(t => t.status === 'in_progress').length;
      const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        ...project,
        taskCount: totalTasks,
        completedTaskCount: completedTasks,
        inProgressTaskCount: inProgressTasks,
        progressPercentage,
      };
    });

    return res.json({ success: true, projects: enrichedProjects });
  } catch (error: any) {
    console.error('getProjects error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve projects' });
  }
}

export async function getProjectById(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { id } = req.params;

    const project = await ProjectModel.findById(id);
    if (!project || project.owner !== req.user._id) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const tasks = await TaskModel.find(t => t.projectId === id && t.owner === req.user!._id);
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return res.json({
      success: true,
      project: {
        ...project,
        tasks,
        taskCount: totalTasks,
        completedTaskCount: completedTasks,
        progressPercentage,
      },
    });
  } catch (error: any) {
    console.error('getProjectById error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve project' });
  }
}

export async function createProject(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { name, description = '', color = '#8B5CF6', icon = 'Folder', status = 'active', startDate, dueDate } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Project name is required' });
    }

    const project = await ProjectModel.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      color: color || '#8B5CF6',
      icon: icon || 'Folder',
      status: status || 'active',
      startDate: startDate || undefined,
      dueDate: dueDate || undefined,
      owner: req.user._id,
    });

    await ActivityModel.create({
      actor: req.user._id,
      actorName: req.user.name,
      action: `Created project "${project.name}"`,
      entityType: 'project',
      entityId: project._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: {
        ...project,
        taskCount: 0,
        completedTaskCount: 0,
        progressPercentage: 0,
      },
    });
  } catch (error: any) {
    console.error('createProject error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create project' });
  }
}

export async function updateProject(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { id } = req.params;

    const existing = await ProjectModel.findById(id);
    if (!existing || existing.owner !== req.user._id) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const { name, description, color, icon, status, startDate, dueDate, isArchived } = req.body;
    const updates: Partial<IProject> = {};

    if (name !== undefined) {
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Project name cannot be empty' });
      }
      updates.name = name.trim();
    }
    if (description !== undefined) updates.description = description;
    if (color !== undefined) updates.color = color;
    if (icon !== undefined) updates.icon = icon;
    if (status !== undefined) updates.status = status;
    if (startDate !== undefined) updates.startDate = startDate || undefined;
    if (dueDate !== undefined) updates.dueDate = dueDate || undefined;
    if (isArchived !== undefined) {
      updates.archivedAt = isArchived ? new Date().toISOString() : undefined;
    }

    const updated = await ProjectModel.findByIdAndUpdate(id, updates);

    await ActivityModel.create({
      actor: req.user._id,
      actorName: req.user.name,
      action: `Updated project "${updated?.name || existing.name}"`,
      entityType: 'project',
      entityId: id,
    });

    return res.json({ success: true, message: 'Project updated successfully', project: updated });
  } catch (error: any) {
    console.error('updateProject error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update project' });
  }
}

export async function deleteProject(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { id } = req.params;

    const existing = await ProjectModel.findById(id);
    if (!existing || existing.owner !== req.user._id) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Disassociate tasks rather than deleting them
    const tasks = await TaskModel.find(t => t.projectId === id && t.owner === req.user!._id);
    for (const t of tasks) {
      await TaskModel.findByIdAndUpdate(t._id, { projectId: undefined });
    }

    await ProjectModel.findByIdAndDelete(id);

    await ActivityModel.create({
      actor: req.user._id,
      actorName: req.user.name,
      action: `Deleted project "${existing.name}"`,
      entityType: 'project',
      entityId: id,
    });

    return res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error: any) {
    console.error('deleteProject error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete project' });
  }
}
