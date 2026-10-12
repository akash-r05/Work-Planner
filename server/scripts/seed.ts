import bcrypt from 'bcryptjs';
import {
  UserModel,
  ProjectModel,
  TaskModel,
  NotificationModel,
  ActivityModel,
} from '../models/index.js';

export async function seedDatabase(force = false) {
  const existingUsers = await UserModel.find({});
  if (existingUsers.length > 0 && !force) {
    return { success: true, message: 'Database already has data. Skipping seed.' };
  }

  // Clear existing if force
  if (force) {
    await UserModel.deleteMany({});
    await ProjectModel.deleteMany({});
    await TaskModel.deleteMany({});
    await NotificationModel.deleteMany({});
    await ActivityModel.deleteMany({});
  }

  // 1. Create Demo User
  const passwordHash = await bcrypt.hash('password123', 10);
  const demoUser = await UserModel.create({
    name: 'Alex Vance',
    email: 'demo@workplanner.io',
    passwordHash,
    preferences: {
      theme: 'dark',
      emailNotifications: true,
      compactView: false,
    },
  });

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const past3Days = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // 2. Create Projects
  const project1 = await ProjectModel.create({
    name: 'Core Platform Redesign',
    description: 'Modernizing the user interface with spatial 3D effects and fluid navigation.',
    color: '#8B5CF6',
    icon: 'Layers',
    status: 'active',
    startDate: yesterday,
    dueDate: in7Days,
    owner: demoUser._id,
  });

  const project2 = await ProjectModel.create({
    name: 'Mobile App Launch',
    description: 'iOS and Android progressive release with offline sync capabilities.',
    color: '#22D3EE',
    icon: 'Smartphone',
    status: 'active',
    startDate: yesterday,
    dueDate: in3Days,
    owner: demoUser._id,
  });

  const project3 = await ProjectModel.create({
    name: 'Cloud Infrastructure Migration',
    description: 'Migrating microservices to high-availability distributed clusters.',
    color: '#34D399',
    icon: 'Server',
    status: 'active',
    startDate: past3Days,
    dueDate: tomorrow,
    owner: demoUser._id,
  });

  const project4 = await ProjectModel.create({
    name: 'Security Compliance Audit',
    description: 'SOC2 Type II certification prep and penetration testing remediations.',
    color: '#FBBF24',
    icon: 'Shield',
    status: 'planning',
    startDate: today,
    dueDate: in7Days,
    owner: demoUser._id,
  });

  // 3. Create Tasks
  const tasks = [
    {
      title: 'Architect 3D spatial card elevation system',
      description: 'Implement perspective transform utilities and ambient shadow lighting.',
      status: 'completed',
      priority: 'high',
      startDate: past3Days,
      dueDate: yesterday,
      checklist: [
        { id: '1', text: 'Define CSS preserve-3d variables', completed: true },
        { id: '2', text: 'Optimize hover tilt performance', completed: true },
        { id: '3', text: 'Add touch device fallbacks', completed: true },
      ],
      tags: ['Frontend', 'UI', '3D'],
      projectId: project1._id,
      completedAt: yesterday + 'T16:00:00.000Z',
    },
    {
      title: 'Design fluid Kanban drag and drop interaction',
      description: 'Support multi-column task moves with keyboard accessible reordering.',
      status: 'in_progress',
      priority: 'urgent',
      startDate: today,
      dueDate: today,
      checklist: [
        { id: '1', text: 'Column drop targets', completed: true },
        { id: '2', text: 'Optimistic UI updates', completed: true },
        { id: '3', text: 'Card status synchronization', completed: false },
      ],
      tags: ['Frontend', 'Kanban'],
      projectId: project1._id,
    },
    {
      title: 'Audit REST API route authorization and ownership',
      description: 'Verify all /api/v1 endpoints validate authenticated user IDs strictly.',
      status: 'in_progress',
      priority: 'high',
      startDate: yesterday,
      dueDate: tomorrow,
      checklist: [
        { id: '1', text: 'Task ownership verification', completed: true },
        { id: '2', text: 'Project isolation verification', completed: true },
        { id: '3', text: 'Prevent ID enumeration', completed: false },
      ],
      tags: ['Security', 'Backend'],
      projectId: project4._id,
    },
    {
      title: 'Implement weekly productivity analytics chart',
      description: 'Visualize completion velocity across rolling 7-day intervals.',
      status: 'in_review',
      priority: 'medium',
      startDate: yesterday,
      dueDate: tomorrow,
      checklist: [
        { id: '1', text: 'Aggregate daily completion logs', completed: true },
        { id: '2', text: 'Render responsive bar chart', completed: true },
      ],
      tags: ['Analytics', 'Recharts'],
      projectId: project1._id,
    },
    {
      title: 'Configure HTTP-only session cookies and CSRF checks',
      description: 'Secure JWT delivery with SameSite=Lax and Bearer authorization fallback.',
      status: 'completed',
      priority: 'urgent',
      startDate: past3Days,
      dueDate: yesterday,
      checklist: [
        { id: '1', text: 'Sign tokens with secret key', completed: true },
        { id: '2', text: 'Cookie parser middleware', completed: true },
      ],
      tags: ['Auth', 'Security'],
      projectId: project4._id,
      completedAt: yesterday + 'T11:30:00.000Z',
    },
    {
      title: 'Refactor database indexing for fast task filtering',
      description: 'Optimize queries for combined status, priority, and date range filters.',
      status: 'todo',
      priority: 'medium',
      startDate: today,
      dueDate: in3Days,
      checklist: [
        { id: '1', text: 'Analyze slow query logs', completed: false },
        { id: '2', text: 'Benchmark 10,000 document records', completed: false },
      ],
      tags: ['Database', 'Performance'],
      projectId: project3._id,
    },
    {
      title: 'Build Interactive 3D Project Progress Rings',
      description: 'Circular SVG progress bars with gradient strokes and animated depth.',
      status: 'todo',
      priority: 'low',
      startDate: tomorrow,
      dueDate: in7Days,
      checklist: [
        { id: '1', text: 'Calculated strokeDashoffset math', completed: false },
        { id: '2', text: 'Accessible textual percentage indicator', completed: false },
      ],
      tags: ['UI', 'SVG'],
      projectId: project1._id,
    },
    {
      title: 'Prepare App Store screenshots and release notes',
      description: 'Generate high-res dark mode workspace previews for version 2.4 release.',
      status: 'todo',
      priority: 'urgent',
      startDate: today,
      dueDate: in3Days,
      checklist: [
        { id: '1', text: 'Capture tablet viewports', completed: false },
        { id: '2', text: 'Draft changelog summary', completed: false },
      ],
      tags: ['Release', 'Mobile'],
      projectId: project2._id,
    },
    {
      title: 'Implement calendar agenda view with date filters',
      description: 'Allow users to browse tasks scheduled by day, week, and month.',
      status: 'completed',
      priority: 'medium',
      startDate: past3Days,
      dueDate: yesterday,
      checklist: [
        { id: '1', text: 'Month grid layout', completed: true },
        { id: '2', text: 'Task date synchronization', completed: true },
      ],
      tags: ['Calendar', 'Frontend'],
      projectId: project1._id,
      completedAt: yesterday + 'T18:45:00.000Z',
    },
    {
      title: 'Overdue: Update SSL certificates on staging environment',
      description: 'Renew wildcard domain certificate to prevent sandbox warnings.',
      status: 'todo',
      priority: 'high',
      startDate: past3Days,
      dueDate: past3Days, // Intentionally overdue
      checklist: [
        { id: '1', text: 'Issue Let’s Encrypt certbot token', completed: false },
      ],
      tags: ['DevOps', 'Infra'],
      projectId: project3._id,
    },
  ];

  for (const t of tasks) {
    await TaskModel.create({
      ...t,
      status: t.status as any,
      priority: t.priority as any,
      owner: demoUser._id,
    });
  }

  // 4. Create Notifications
  await NotificationModel.create({
    recipient: demoUser._id,
    type: 'deadline_approaching',
    title: 'Task due today',
    message: '“Design fluid Kanban drag and drop interaction” is due before midnight.',
  });

  await NotificationModel.create({
    recipient: demoUser._id,
    type: 'task_overdue',
    title: 'Attention: Overdue task',
    message: '“Update SSL certificates on staging environment” is past its scheduled deadline.',
  });

  await NotificationModel.create({
    recipient: demoUser._id,
    type: 'system',
    title: 'Workspace Initialized',
    message: 'Demo projects and sample tasks have been loaded into your workspace.',
  });

  // 5. Create Activities
  await ActivityModel.create({
    actor: demoUser._id,
    actorName: demoUser.name,
    action: 'Completed task "Architect 3D spatial card elevation system"',
    entityType: 'task',
    entityId: demoUser._id,
  });

  await ActivityModel.create({
    actor: demoUser._id,
    actorName: demoUser.name,
    action: 'Created project "Core Platform Redesign"',
    entityType: 'project',
    entityId: project1._id,
  });

  return { success: true, message: 'Database seeded successfully with demo user & rich records' };
}
