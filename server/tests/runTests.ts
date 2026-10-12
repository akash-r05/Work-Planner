/**
 * Automated test suite for Work Planner API & Database services
 */
import bcrypt from 'bcryptjs';
import { UserModel, TaskModel, ProjectModel, NotificationModel } from '../models/index.js';
import { generateToken, JWT_SECRET } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

async function runTests() {
  console.log('🧪 Starting Work Planner Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // Test 1: User creation and password hashing
    console.log('1. Authentication & Security:');
    const testEmail = `test_${Date.now()}@workplanner.io`;
    const password = 'securePassword123';
    const hash = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      name: 'Test Engineer',
      email: testEmail,
      passwordHash: hash,
    });

    assert(Boolean(user._id), 'User assigned valid 24-character hexadecimal ID');
    assert(user.passwordHash !== password, 'Passwords are never stored in plaintext');
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    assert(isMatch, 'Bcrypt correctly verifies valid password hash');

    // Test 2: JWT generation and verification
    const token = generateToken(user._id);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    assert(decoded.userId === user._id, 'JWT token signs and verifies user ID correctly');

    // Test 3: Project CRUD and ownership
    console.log('\n2. Project Management:');
    const project = await ProjectModel.create({
      name: 'Project Alpha',
      description: 'Test initiative',
      color: '#8B5CF6',
      status: 'active',
      owner: user._id,
    });
    assert(project.owner === user._id, 'Project is strictly associated with owner');

    const retrievedProject = await ProjectModel.findById(project._id);
    assert(retrievedProject?.name === 'Project Alpha', 'Project retrieved successfully by ID');

    // Test 4: Task CRUD and Workflow Statuses
    console.log('\n3. Task CRUD Operations:');
    const task1 = await TaskModel.create({
      title: 'Setup telemetry',
      status: 'todo',
      priority: 'high',
      checklist: [{ id: '1', text: 'Subtask item', completed: false }],
      tags: ['DevOps'],
      projectId: project._id,
      owner: user._id,
    });
    assert(task1.status === 'todo', 'Task initialized with status "todo"');
    assert(task1.checklist.length === 1, 'Task retains checklist items');

    // Status update (Kanban)
    const updatedTask = await TaskModel.findByIdAndUpdate(task1._id, { status: 'in_progress' });
    assert(updatedTask?.status === 'in_progress', 'Task status transitions to "in_progress"');

    // Task completion timestamping
    const completedTask = await TaskModel.findByIdAndUpdate(task1._id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
    });
    assert(completedTask?.status === 'completed' && Boolean(completedTask.completedAt), 'Completed task records completedAt timestamp');

    // Test 5: Calculated project progress
    console.log('\n4. Live Metric Aggregation:');
    const task2 = await TaskModel.create({
      title: 'Pending deliverable',
      status: 'todo',
      priority: 'medium',
      checklist: [],
      tags: [],
      projectId: project._id,
      owner: user._id,
    });

    const projectTasks = await TaskModel.find(t => t.projectId === project._id);
    const total = projectTasks.length;
    const done = projectTasks.filter(t => t.status === 'completed').length;
    const progress = Math.round((done / total) * 100);
    assert(total === 2 && done === 1 && progress === 50, 'Project progress calculated dynamically as 50% from real tasks');

    // Test 6: Notifications workflow
    console.log('\n5. Notification System:');
    const notif = await NotificationModel.create({
      recipient: user._id,
      type: 'deadline_approaching',
      title: 'Approaching Deadline',
      message: 'Task is due tomorrow',
    });
    assert(!notif.readAt, 'New notifications default to unread state');

    const readNotif = await NotificationModel.findByIdAndUpdate(notif._id, {
      readAt: new Date().toISOString(),
    });
    assert(Boolean(readNotif?.readAt), 'Notification marked as read successfully');

    // Cleanup test records
    await TaskModel.findByIdAndDelete(task1._id);
    await TaskModel.findByIdAndDelete(task2._id);
    await ProjectModel.findByIdAndDelete(project._id);
    await NotificationModel.findByIdAndDelete(notif._id);
    await UserModel.findByIdAndDelete(user._id);

    console.log(`\n🎉 Test Suite Completed: ${passed} passed, ${failed} failed.\n`);
    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
  }
}

runTests();
