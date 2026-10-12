import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Activity as ActivityIcon,
} from 'lucide-react';
import { INotification, IActivity } from '../../types';
import { api } from '../../services/api';

interface NotificationsViewProps {
  notifications: INotification[];
  activities: IActivity[];
  onRefreshNotifications: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  activities,
  onRefreshNotifications,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [activeTab, setActiveTab] = useState<'notifications' | 'activity'>('notifications');

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      onRefreshNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkOne = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      onRefreshNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'unread') return !n.readAt;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.readAt).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Notifications & Audit Stream</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            System alerts, deadline warnings, and sequential workspace activity logs.
          </p>
        </div>

        {unreadCount > 0 && activeTab === 'notifications' && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-violet-300 text-xs font-medium rounded-xl transition-colors self-start sm:self-auto border border-violet-500/20"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'notifications'
              ? 'bg-violet-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.2 rounded-full tabular-nums">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'activity'
              ? 'bg-violet-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ActivityIcon className="w-3.5 h-3.5" />
          <span>Activity Audit Stream</span>
        </button>
      </div>

      {/* Notifications Tab Content */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filter === 'all' ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filter === 'unread' ? 'bg-slate-800 text-violet-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unread only ({unreadCount})
            </button>
          </div>

          {filteredNotifs.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-slate-800 bg-[#141B2D]/40 text-xs text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-400/80 mx-auto mb-2" />
              <span>You have no notifications in this view.</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredNotifs.map(n => {
                const isUnread = !n.readAt;
                return (
                  <div
                    key={n._id}
                    onClick={() => isUnread && handleMarkOne(n._id)}
                    className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                      isUnread
                        ? 'bg-violet-950/20 border-violet-500/40 hover:bg-violet-950/30'
                        : 'bg-[#141B2D] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                        {n.type === 'task_overdue' ? (
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                        ) : n.type === 'deadline_approaching' ? (
                          <Clock className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-cyan-400" />
                        )}
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-100">{n.title}</span>
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-violet-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-2 tabular-nums">
                          {new Date(n.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    {isUnread && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleMarkOne(n._id);
                        }}
                        className="text-[11px] text-slate-400 hover:text-violet-300 font-medium shrink-0"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Activity Stream Tab Content */}
      {activeTab === 'activity' && (
        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-slate-800 bg-[#141B2D]/40 text-xs text-slate-400">
              No historical activity entries yet.
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-[#141B2D] p-5 shadow-xl divide-y divide-slate-800/60">
              {activities.map(act => (
                <div key={act._id} className="py-3 flex items-start justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-300 shrink-0">
                      {act.actorName ? act.actorName[0] : 'U'}
                    </div>
                    <div className="flex flex-col text-xs">
                      <span className="font-medium text-slate-200">
                        <strong className="text-violet-300 font-semibold">{act.actorName}</strong>{' '}
                        {act.action}
                      </span>
                      <span className="text-[10px] text-slate-400 capitalize mt-0.5">
                        Target: {act.entityType}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 tabular-nums shrink-0">
                    {new Date(act.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
