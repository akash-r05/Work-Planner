import { DocumentStore } from '../db/store.js';
import { IUser, ITask, IProject, INotification, IActivity } from './types.js';

export const UserModel = new DocumentStore<IUser>('users');
export const TaskModel = new DocumentStore<ITask>('tasks');
export const ProjectModel = new DocumentStore<IProject>('projects');
export const NotificationModel = new DocumentStore<INotification>('notifications');
export const ActivityModel = new DocumentStore<IActivity>('activities');

export * from './types.js';
