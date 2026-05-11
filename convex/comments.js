import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const getUserByToken = async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return ctx.db
    .query("users")
    .filter((q) => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
    .unique();
};

export const addComment = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Must be logged in to comment");

    const user = await getUserByToken(ctx);
    if (!user) throw new Error("User not found");

    const post = await ctx.db.get(args.postId);
    if (!post || post.status !== "published") throw new Error("Post not found or not published");

    if (!args.content.trim() || args.content.length > 1000) {
      throw new Error("Comment must be between 1-1000 characters");
    }

    const commentId = await ctx.db.insert("comments", {
      postId: args.postId,
      authorId: user._id,
      authorName: user.name,
      authorEmail: user.email,
      content: args.content.trim(),
      status: "approved",
      createdAt: Date.now(),
    });

    // Increment comment count on post
    await ctx.db.patch(args.postId, {
      commentCount: (post.commentCount ?? 0) + 1,
    });

    // Notify post author (not self)
    if (post.authorId !== user._id) {
      await ctx.db.insert("notifications", {
        userId: post.authorId,
        actorId: user._id,
        actorName: user.name,
        actorImage: user.imageUrl,
        type: "comment",
        postId: args.postId,
        postTitle: post.title,
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return commentId;
  },
});

export const getPostComments = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post_status", (q) => q.eq("postId", args.postId).eq("status", "approved"))
      .order("asc")
      .collect();

    const commentsWithUsers = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.authorId);
        return {
          ...comment,
          author: user
            ? { _id: user._id, name: user.name, username: user.username, imageUrl: user.imageUrl }
            : null,
        };
      })
    );

    return commentsWithUsers.filter((c) => c.author !== null);
  },
});

export const deleteComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const user = await getUserByToken(ctx);
    if (!user) throw new Error("Not authenticated");

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");

    const post = await ctx.db.get(comment.postId);
    if (!post) throw new Error("Post not found");

    const canDelete = comment.authorId === user._id || post.authorId === user._id;
    if (!canDelete) throw new Error("Not authorized to delete this comment");

    await ctx.db.delete(args.commentId);

    // Decrement comment count
    await ctx.db.patch(comment.postId, {
      commentCount: Math.max(0, (post.commentCount ?? 1) - 1),
    });

    return { success: true };
  },
});
