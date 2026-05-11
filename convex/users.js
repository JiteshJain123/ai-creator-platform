// convex/users.js

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 💡 Helper function to get the current user by their Clerk ID (identity.subject)
const getUserByClerkId = async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject)) // Using the new index
    .unique();

  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    // Check if we've already stored this identity before using the reliable Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (user !== null) {
      // If we've seen this identity before but the name/image has changed, patch the value.
      if (user.name !== identity.name || user.imageUrl !== identity.pictureUrl) {
        await ctx.db.patch(user._id, {
          name: identity.name,
          imageUrl: identity.pictureUrl,
        });
      }
      return user._id;
    }

    // If it's a new identity, create a new `User`.
    return await ctx.db.insert("users", {
      name: identity.name ?? "Anonymous",
      // --- 💡 FIX: Replaced TypeScript '!' with JavaScript '?? ""' ---
      email: identity.email ?? "",
      imageUrl: identity.pictureUrl,
      tokenIdentifier: identity.tokenIdentifier, // Still useful for Clerk webhooks
      clerkId: identity.subject, // <-- 💡 THE CRUCIAL FIX: Store the Clerk User ID
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    });
  },
});

export const getCurrentUser = query({
  handler: async (ctx) => {
    return await getUserByClerkId(ctx);
  },
});

export const updateUsername = mutation({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUserByClerkId(ctx); // Use helper function

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(args.username)) {
      throw new Error(
        "Username can only contain letters, numbers, underscores, and hyphens"
      );
    }
    if (args.username.length < 3 || args.username.length > 20) {
      throw new Error("Username must be between 3 and 20 characters");
    }

    // Check if username is already taken
    if (args.username !== user.username) {
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", args.username))
        .unique();

      if (existingUser) {
        throw new Error("Username is already taken");
      }
    }

    await ctx.db.patch(user._id, {
      username: args.username,
      lastActiveAt: Date.now(),
    });

    return user._id;
  },
});

export const getByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    if (!args.username) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();

    if (!user) return null;

    // Enrich with follower/following/post counts
    const [followerRows, followingRows, postRows] = await Promise.all([
      ctx.db.query("follows").withIndex("by_following", (q) => q.eq("followingId", user._id)).collect(),
      ctx.db.query("follows").withIndex("by_follower",  (q) => q.eq("followerId",  user._id)).collect(),
      ctx.db.query("posts").withIndex("by_author_status", (q) => q.eq("authorId", user._id).eq("status", "published")).collect(),
    ]);

    return {
      _id: user._id,
      name: user.name,
      username: user.username,
      imageUrl: user.imageUrl,
      bio: user.bio ?? null,
      createdAt: user.createdAt,
      clerkId: user.clerkId,
      followerCount: followerRows.length,
      followingCount: followingRows.length,
      postCount: postRows.length,
    };
  },
});

export const updateBio = mutation({
  args: { bio: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByClerkId(ctx);
    if (args.bio.length > 200) throw new Error("Bio must be 200 characters or less");
    await ctx.db.patch(user._id, { bio: args.bio, lastActiveAt: Date.now() });
    return user._id;
  },
});