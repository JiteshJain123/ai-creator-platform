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

// Toggle bookmark on a post
export const toggleBookmark = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const user = await getUserByClerkId(ctx);
    if (!user) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_post", (q) =>
        q.eq("userId", user._id).eq("postId", args.postId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { bookmarked: false };
    }

    await ctx.db.insert("bookmarks", {
      userId: user._id,
      postId: args.postId,
      createdAt: Date.now(),
    });
    return { bookmarked: true };
  },
});

// Check if current user has bookmarked a post
export const hasBookmarked = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const user = await getUserByClerkId(ctx);
    if (!user) return false;

    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_post", (q) =>
        q.eq("userId", user._id).eq("postId", args.postId)
      )
      .unique();

    return !!existing;
  },
});

// Get current user's bookmarked posts
export const getMyBookmarks = query({
  handler: async (ctx) => {
    const user = await getUserByClerkId(ctx);
    if (!user) return [];

    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    const posts = await Promise.all(
      bookmarks.map(async (bm) => {
        const post = await ctx.db.get(bm.postId);
        if (!post || post.status !== "published") return null;

        const author = await ctx.db.get(post.authorId);
        return {
          ...post,
          bookmarkedAt: bm.createdAt,
          author: author
            ? {
                _id: author._id,
                name: author.name,
                username: author.username,
                imageUrl: author.imageUrl,
              }
            : null,
        };
      })
    );

    return posts.filter(Boolean);
  },
});
