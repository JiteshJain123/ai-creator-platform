// convex/feed.js
import { v } from "convex/values";
import { query } from "./_generated/server";

// Get feed posts - prioritizes followed users for logged-in users
export const getFeed = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const limit = args.limit || 10;

    // Get current user if authenticated
    let currentUser = null;
    let followedUserIds = [];

    if (identity) {
      currentUser = await ctx.db
        .query("users")
        .filter((q) =>
          q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier)
        )
        .unique();

      if (currentUser) {
        // Get list of users current user is following
        const follows = await ctx.db
          .query("follows")
          .filter((q) => q.eq(q.field("followerId"), currentUser._id))
          .collect();

        followedUserIds = follows.map((follow) => follow.followingId);
      }
    }

    // If user is logged in and following people, prioritize their posts
    let feedPosts = [];
    let hasMore = false;

    if (followedUserIds.length > 0) {
      // Get posts from followed users first
      const followedPosts = await ctx.db
        .query("posts")
        .filter((q) =>
          q.and(
            q.eq(q.field("status"), "published"),
            q.or(...followedUserIds.map((id) => q.eq(q.field("authorId"), id)))
          )
        )
        .order("desc")
        .take(Math.ceil(limit * 0.7)); // 70% from followed users

      feedPosts = [...followedPosts];

      // Fill remaining with general posts (excluding already included and own posts)
      const remainingLimit = limit - followedPosts.length;
      if (remainingLimit > 0) {
        const excludeIds = new Set([
          ...followedPosts.map((p) => p._id),
          //   currentUser._id, // Exclude own posts
        ]);

        const generalPosts = await ctx.db
          .query("posts")
          .filter((q) =>
            q.and(
              q.eq(q.field("status"), "published"),
              q.neq(q.field("authorId"), currentUser._id)
            )
          )
          .order("desc")
          .collect();

        const filteredGeneralPosts = generalPosts
          .filter(
            (post) =>
              !excludeIds.has(post._id) &&
              !followedUserIds.includes(post.authorId)
          )
          .slice(0, remainingLimit);

        feedPosts = [...feedPosts, ...filteredGeneralPosts];
      }
    } else {
      // For non-logged-in users or users not following anyone, show general feed
      let query = ctx.db
        .query("posts")
        .filter((q) => q.eq(q.field("status"), "published"));

      // Exclude own posts if logged in
      //   if (currentUser) {
      //     query = query.filter((q) =>
      //       q.neq(q.field("authorId"), currentUser._id)
      //     );
      //   }

      const allPosts = await query.order("desc").take(limit + 1);
      hasMore = allPosts.length > limit;
      feedPosts = hasMore ? allPosts.slice(0, limit) : allPosts;
    }

    // Sort all posts by published date
    feedPosts.sort((a, b) => b.publishedAt - a.publishedAt);

    // Add author information to each post
    const postsWithAuthors = await Promise.all(
      feedPosts.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        return {
          ...post,
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

    // Filter out posts with no author (deleted users)
    const validPosts = postsWithAuthors.filter((post) => post.author !== null);

    return {
      posts: validPosts,
      hasMore: validPosts.length === limit,
      nextCursor:
        validPosts.length > 0 ? validPosts[validPosts.length - 1]._id : null,
    };
  },
});

// Get users that current user is following
export const getFollowing = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const currentUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
      .unique();

    if (!currentUser) {
      return [];
    }

    const limit = args.limit || 20;

    // Get follows
    const follows = await ctx.db
      .query("follows")
      .filter((q) => q.eq(q.field("followerId"), currentUser._id))
      .order("desc")
      .take(limit);

    // Get user details for each follow
    const following = await Promise.all(
      follows.map(async (follow) => {
        const user = await ctx.db.get(follow.followingId);
        if (!user) return null;

        // Get recent post count
        const recentPosts = await ctx.db
          .query("posts")
          .filter((q) =>
            q.and(
              q.eq(q.field("authorId"), user._id),
              q.eq(q.field("status"), "published")
            )
          )
          .order("desc")
          .take(3);

        return {
          _id: user._id,
          name: user.name,
          username: user.username,
          imageUrl: user.imageUrl,
          followedAt: follow.createdAt,
          recentPostCount: recentPosts.length,
          lastPostAt:
            recentPosts.length > 0 ? recentPosts[0].publishedAt : null,
        };
      })
    );

    return following.filter((user) => user !== null);
  },
});

// Get suggested users to follow
export const getSuggestedUsers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const limit = args.limit || 10;

    let currentUser = null;
    let followedUserIds = [];

    if (identity) {
      currentUser = await ctx.db
        .query("users")
        .filter((q) =>
          q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier)
        )
        .unique();

      if (currentUser) {
        // Get users already being followed
        const follows = await ctx.db
          .query("follows")
          .filter((q) => q.eq(q.field("followerId"), currentUser._id))
          .collect();

        followedUserIds = follows.map((follow) => follow.followingId);
      }
    }

    // Get users with recent posts who aren't being followed
    const allUsers = await ctx.db
      .query("users")
      .filter((q) => q.neq(q.field("_id"), currentUser?._id || ""))
      .collect();

    // Filter out already followed users and get their stats
    const suggestions = await Promise.all(
      allUsers
        .filter((user) => !followedUserIds.includes(user._id) && user.username)
        .map(async (user) => {
          // Get user's published posts
          const posts = await ctx.db
            .query("posts")
            .filter((q) =>
              q.and(
                q.eq(q.field("authorId"), user._id),
                q.eq(q.field("status"), "published")
              )
            )
            .order("desc")
            .take(5);

          // Get follower count
          const followers = await ctx.db
            .query("follows")
            .filter((q) => q.eq(q.field("followingId"), user._id))
            .collect();

          // Calculate engagement score for ranking
          const totalViews = posts.reduce(
            (sum, post) => sum + post.viewCount,
            0
          );
          const totalLikes = posts.reduce(
            (sum, post) => sum + post.likeCount,
            0
          );
          const engagementScore =
            totalViews + totalLikes * 5 + followers.length * 10;

          return {
            _id: user._id,
            name: user.name,
            username: user.username,
            imageUrl: user.imageUrl,
            followerCount: followers.length,
            postCount: posts.length,
            engagementScore,
            lastPostAt: posts.length > 0 ? posts[0].publishedAt : null,
            recentPosts: posts.slice(0, 2).map((post) => ({
              _id: post._id,
              title: post.title,
              viewCount: post.viewCount,
              likeCount: post.likeCount,
            })),
          };
        })
    );

    // Sort by engagement score and recent activity
    const rankedSuggestions = suggestions
      .filter((user) => user.postCount > 0) // Only users with posts
      .sort((a, b) => {
        // Prioritize recent activity
        const aRecent = a.lastPostAt > Date.now() - 7 * 24 * 60 * 60 * 1000;
        const bRecent = b.lastPostAt > Date.now() - 7 * 24 * 60 * 60 * 1000;

        if (aRecent && !bRecent) return -1;
        if (!aRecent && bRecent) return 1;

        // Then by engagement score
        return b.engagementScore - a.engagementScore;
      })
      .slice(0, limit);

    return rankedSuggestions;
  },
});

// Get trending posts (high engagement in last 7 days)
export const getTrendingPosts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    // Get recent published posts
    const recentPosts = await ctx.db
      .query("posts")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "published"),
          q.gte(q.field("publishedAt"), weekAgo)
        )
      )
      .collect();

    // Calculate trending score and sort
    const trendingPosts = recentPosts
      .map((post) => ({
        ...post,
        trendingScore: post.viewCount + post.likeCount * 3,
      }))
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, limit);

    // Add author information
    const postsWithAuthors = await Promise.all(
      trendingPosts.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        return {
          ...post,
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

    return postsWithAuthors.filter((post) => post.author !== null);
  },
});
