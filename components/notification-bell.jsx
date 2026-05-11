"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  CheckCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { formatDistanceToNow } from "date-fns";

const typeConfig = {
  like:    { icon: Heart,          color: "text-red-400",    bg: "bg-red-500/10"    },
  comment: { icon: MessageCircle,  color: "text-blue-400",   bg: "bg-blue-500/10"   },
  follow:  { icon: UserPlus,       color: "text-green-400",  bg: "bg-green-500/10"  },
};

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: unreadCount = 0 } = useConvexQuery(api.notifications.getUnreadCount);
  const { data: notifications = [] } = useConvexQuery(
    api.notifications.getMyNotifications,
    { limit: 15 }
  );

  const { mutate: markAllRead } = useConvexMutation(api.notifications.markAllAsRead);
  const { mutate: deleteNotification } = useConvexMutation(api.notifications.deleteNotification);

  const handleMarkAll = async () => {
    await markAllRead();
  };

  const getNotificationText = (n) => {
    switch (n.type) {
      case "like":    return `liked your post "${n.postTitle}"`;
      case "comment": return `commented on "${n.postTitle}"`;
      case "follow":  return "started following you";
      default: return "";
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 top-12 w-80 sm:w-96 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl shadow-black/40 z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-purple-400" />
                <span className="font-semibold text-white text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAll}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-purple-400 transition-colors px-2 py-1 rounded-lg hover:bg-purple-500/10"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">No notifications yet</p>
                  <p className="text-slate-500 text-xs mt-1">You'll see likes, comments, and follows here</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const config = typeConfig[n.type];
                  const Icon = config.icon;

                  return (
                    <div
                      key={n._id}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-700/40 transition-colors border-b border-slate-700/50 last:border-0 ${
                        !n.isRead ? "bg-purple-500/5" : ""
                      }`}
                    >
                      {/* Actor avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-9 h-9 rounded-full overflow-hidden">
                          {n.actorImage ? (
                            <Image src={n.actorImage} alt={n.actorName} width={36} height={36} className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-sm font-bold text-white">
                              {n.actorName?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center ${config.bg}`}>
                          <Icon className={`h-2.5 w-2.5 ${config.color}`} />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200 leading-snug">
                          <span className="font-semibold text-white">{n.actorName}</span>
                          {" "}{getNotificationText(n)}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {!n.isRead && (
                          <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteNotification({ notificationId: n._id }); }}
                          className="p-1 rounded text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Dismiss"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2.5 border-t border-slate-700">
                <Link
                  href="/dashboard/notifications"
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  View all notifications →
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
