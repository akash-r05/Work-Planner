import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { TaskModel, ProjectModel, ActivityModel } from '../models/index.js';

export async function getDashboardSummary(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const userId = req.user._id;

    const allTasks = await TaskModel.find(t => t.owner === userId);
    const allProjects = await ProjectModel.find(p => p.owner === userId && !p.archivedAt);
    const recentActivities = (await ActivityModel.find(a => a.actor === userId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 7);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = allTasks.filter(t => t.status === 'in_progress').length;
    const inReviewTasks = allTasks.filter(t => t.status === 'in_review').length;
    const todoTasks = allTasks.filter(t => t.status === 'todo').length;

    const overdueTasks = allTasks.filter(t => {
      return t.dueDate && t.dueDate < now.toISOString() && t.status !== 'completed';
    }).length;

    // Today's agenda
    const todayAgenda = allTasks.filter(t => {
      return t.dueDate && t.dueDate.startsWith(todayStr);
    });

    // Upcoming deadlines (next 7 days, excluding today and overdue)
    const upcomingDeadlines = allTasks
      .filter(t => {
        return (
          t.dueDate &&
          t.dueDate > now.toISOString() &&
          t.dueDate <= sevenDaysFromNow &&
          t.status !== 'completed'
        );
      })
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);

    // Enriched projects
    const recentProjects = allProjects.slice(0, 4).map(p => {
      const pTasks = allTasks.filter(t => t.projectId === p._id);
      const done = pTasks.filter(t => t.status === 'completed').length;
      const progress = pTasks.length > 0 ? Math.round((done / pTasks.length) * 100) : 0;
      return {
        ...p,
        taskCount: pTasks.length,
        completedTaskCount: done,
        progressPercentage: progress,
      };
    });

    // Priority distribution
    const priorityDistribution = {
      urgent: allTasks.filter(t => t.priority === 'urgent').length,
      high: allTasks.filter(t => t.priority === 'high').length,
      medium: allTasks.filter(t => t.priority === 'medium').length,
      low: allTasks.filter(t => t.priority === 'low').length,
    };

    // Status distribution
    const statusDistribution = {
      todo: todoTasks,
      in_progress: inProgressTasks,
      in_review: inReviewTasks,
      completed: completedTasks,
    };

    // Completion rate
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return res.json({
      success: true,
      summary: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        overdueTasks,
        completionRate,
        todayAgenda,
        upcomingDeadlines,
        recentProjects,
        recentActivities,
        priorityDistribution,
        statusDistribution,
      },
    });
  } catch (error: any) {
    console.error('getDashboardSummary error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve dashboard summary' });
  }
}

export async function getProductivityAnalytics(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const userId = req.user._id;

    const allTasks = await TaskModel.find(t => t.owner === userId);

    // Last 7 days daily productivity
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const last7DaysData = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayName = days[d.getDay()];
      const dateStr = d.toISOString().split('T')[0];

      const completedCount = allTasks.filter(t => {
        return t.completedAt && t.completedAt.startsWith(dateStr);
      }).length;

      const createdCount = allTasks.filter(t => {
        return t.createdAt && t.createdAt.startsWith(dateStr);
      }).length;

      last7DaysData.push({
        date: dateStr,
        day: dayName,
        completed: completedCount,
        created: createdCount,
      });
    }

    // Weekly completion rate & overview
    const totalCompleted = allTasks.filter(t => t.status === 'completed').length;
    const totalCount = allTasks.length;
    const completionRate = totalCount > 0 ? Math.round((totalCompleted / totalCount) * 100) : 0;

    return res.json({
      success: true,
      weeklyTrend: last7DaysData,
      totalCompleted,
      totalTasks: totalCount,
      completionRate,
    });
  } catch (error: any) {
    console.error('getProductivityAnalytics error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve productivity analytics' });
  }
}

export async function getTaskAnalytics(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const userId = req.user._id;

    const allTasks = await TaskModel.find(t => t.owner === userId);
    const allProjects = await ProjectModel.find(p => p.owner === userId);

    const statusData = [
      { name: 'To Do', value: allTasks.filter(t => t.status === 'todo').length, color: '#94A3B8' },
      { name: 'In Progress', value: allTasks.filter(t => t.status === 'in_progress').length, color: '#38BDF8' },
      { name: 'In Review', value: allTasks.filter(t => t.status === 'in_review').length, color: '#A855F7' },
      { name: 'Completed', value: allTasks.filter(t => t.status === 'completed').length, color: '#34D399' },
    ];

    const priorityData = [
      { name: 'Low', count: allTasks.filter(t => t.priority === 'low').length, fill: '#64748B' },
      { name: 'Medium', count: allTasks.filter(t => t.priority === 'medium').length, fill: '#38BDF8' },
      { name: 'High', count: allTasks.filter(t => t.priority === 'high').length, fill: '#F59E0B' },
      { name: 'Urgent', count: allTasks.filter(t => t.priority === 'urgent').length, fill: '#EF4444' },
    ];

    const projectBreakdown = allProjects.map(proj => {
      const pTasks = allTasks.filter(t => t.projectId === proj._id);
      return {
        id: proj._id,
        name: proj.name,
        color: proj.color,
        total: pTasks.length,
        completed: pTasks.filter(t => t.status === 'completed').length,
        inProgress: pTasks.filter(t => t.status === 'in_progress').length,
      };
    });

    return res.json({
      success: true,
      statusData,
      priorityData,
      projectBreakdown,
    });
  } catch (error: any) {
    console.error('getTaskAnalytics error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve task analytics' });
  }
}
