import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const getUserByClerkId = async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
};

export const getMyNotifications = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getUserByClerkId(ctx);
    if (!user) return [];

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(args.limit || 30);

    return notifications;
  },
});

export const getUnreadCount = query({
  handler: async (ctx) => {
    const user = await getUserByClerkId(ctx);
    if (!user) return 0;

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", user._id).eq("isRead", false))
      .collect();

    return unread.length;
  },
});

export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await getUserByClerkId(ctx);
    if (!user) throw new Error("Not authenticated");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== user._id) throw new Error("Not found");

    await ctx.db.patch(args.notificationId, { isRead: true });
  },
});

export const markAllAsRead = mutation({
  handler: async (ctx) => {
    const user = await getUserByClerkId(ctx);
    if (!user) throw new Error("Not authenticated");

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", user._id).eq("isRead", false))
      .collect();

    await Promise.all(unread.map((n) => ctx.db.patch(n._id, { isRead: true })));
    return { count: unread.length };
  },
});

export const deleteNotification = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await getUserByClerkId(ctx);
    if (!user) throw new Error("Not authenticated");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== user._id) throw new Error("Not found");

    await ctx.db.delete(args.notificationId);
  },
});
