import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const toggleLike = mutation({
  args: {
    postId: v.id("posts"),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post || post.status !== "published") throw new Error("Post not found or not published");

    let userId = args.userId;
    let actor = null;

    if (!userId) {
      const identity = await ctx.auth.getUserIdentity();
      if (identity) {
        actor = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
          .unique();
        userId = actor?._id;
      }
    } else {
      actor = await ctx.db.get(userId);
    }

    let existingLike;
    if (userId) {
      existingLike = await ctx.db
        .query("likes")
        .withIndex("by_post_user", (q) => q.eq("postId", args.postId).eq("userId", userId))
        .unique();
    }

    if (existingLike) {
      await ctx.db.delete(existingLike._id);
      await ctx.db.patch(args.postId, { likeCount: Math.max(0, post.likeCount - 1) });
      return { liked: false, likeCount: Math.max(0, post.likeCount - 1) };
    } else {
      await ctx.db.insert("likes", { postId: args.postId, userId, createdAt: Date.now() });
      await ctx.db.patch(args.postId, { likeCount: post.likeCount + 1 });

      // Notify post author (not self-like)
      if (actor && post.authorId !== actor._id) {
        await ctx.db.insert("notifications", {
          userId: post.authorId,
          actorId: actor._id,
          actorName: actor.name,
          actorImage: actor.imageUrl,
          type: "like",
          postId: args.postId,
          postTitle: post.title,
          isRead: false,
          createdAt: Date.now(),
        });
      }

      return { liked: true, likeCount: post.likeCount + 1 };
    }
  },
});

export const hasUserLiked = query({
  args: {
    postId: v.id("posts"),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let userId = args.userId;

    if (!userId) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) return false;
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
        .unique();
      if (!user) return false;
      userId = user._id;
    }

    const like = await ctx.db
      .query("likes")
      .withIndex("by_post_user", (q) => q.eq("postId", args.postId).eq("userId", userId))
      .unique();

    return !!like;
  },
});
