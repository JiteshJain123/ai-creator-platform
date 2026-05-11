"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  CheckCheck,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const typeConfig = {
  like:    { icon: Heart,         color: "text-red-400",   bg: "bg-red-500/15",   label: "liked your post"        },
  comment: { icon: MessageCircle, color: "text-blue-400",  bg: "bg-blue-500/15",  label: "commented on your post" },
  follow:  { icon: UserPlus,      color: "text-green-400", bg: "bg-green-500/15", label: "started following you"  },
};

export default function NotificationsPage() {
  const { data: notifications = [], isLoading } = useConvexQuery(
    api.notifications.getMyNotifications,
    { limit: 50 }
  );

  const { mutate: markAll } = useConvexMutation(api.notifications.markAllAsRead);
  const { mutate: deleteOne } = useConvexMutation(api.notifications.deleteNotification);
  const { mutate: markOne } = useConvexMutation(api.notifications.markAsRead);

  const unread = notifications.filter((n) => !n.isRead);

  const handleMarkAll = async () => {
    await markAll();
    toast.success("All notifications marked as read");
  };

  const handleDelete = async (id) => {
    await deleteOne({ notificationId: id });
  };

  const handleMarkOne = async (n) => {
    if (!n.isRead) await markOne({ notificationId: n._id });
  };

  const getNotificationText = (n) => {
    switch (n.type) {
      case "like":    return <>liked your post <span className="text-white font-medium">"{n.postTitle}"</span></>;
      case "comment": return <>commented on <span className="text-white font-medium">"{n.postTitle}"</span></>;
      case "follow":  return "started following you";
      default: return "";
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text-primary flex items-center gap-3">
            <Bell className="h-8 w-8 text-purple-400" />
            Notifications
          </h1>
          <p className="text-slate-400 mt-1">
            {unread.length > 0 ? `${unread.length} unread notification${unread.length !== 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>

        {unread.length > 0 && (
          <Button
            onClick={handleMarkAll}
            variant="outline"
            size="sm"
            className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto" />
            <p className="text-slate-400">Loading notifications...</p>
          </div>
        </div>
      ) : notifications.length === 0 ? (
        <Card className="card-glass">
          <CardContent className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-5">
              <Bell className="h-8 w-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No notifications yet</h3>
            <p className="text-slate-400 max-w-sm mx-auto">
              When someone likes, comments, or follows you, you'll see it here.
            </p>
            <Link href="/feed" className="inline-block mt-5">
              <Button variant="primary" size="sm">Explore the Feed</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const config = typeConfig[n.type];
            const Icon = config.icon;

            return (
              <div
                key={n._id}
                onClick={() => handleMarkOne(n)}
                className={`group flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                  !n.isRead
                    ? "bg-purple-500/5 border-purple-500/20 hover:border-purple-500/40"
                    : "bg-slate-800/30 border-slate-700/50 hover:border-slate-600"
                }`}
              >
                {/* Actor avatar with type icon */}
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-full overflow-hidden">
                    {n.actorImage ? (
                      <Image src={n.actorImage} alt={n.actorName} width={44} height={44} className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-base font-bold text-white">
                        {n.actorName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 ${config.bg}`}>
                    <Icon className={`h-3 w-3 ${config.color}`} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <span className="font-semibold text-white">{n.actorName}</span>
                    {" "}{getNotificationText(n)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!n.isRead && (
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(n._id); }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
