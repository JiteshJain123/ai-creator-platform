"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { TrendingUp, UserPlus, Loader2, Sparkles, Hash, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import PostCard from "@/components/post-card";
import ScrollToTop from "@/components/scroll-to-top";

const CATEGORIES = [
  "All", "Technology", "Design", "Marketing", "Business",
  "Lifestyle", "Education", "Health", "Travel", "Food", "Entertainment",
];

export default function FeedPage() {
  const { user: currentUser } = useUser();
  const [activeTab, setActiveTab]       = useState("feed");
  const [activeCategory, setActiveCategory] = useState("All");

  // Data queries
  const { data: feedData,       isLoading: feedLoading }        = useConvexQuery(api.feed.getFeed,            { limit: 20 });
  const { data: suggestedUsers, isLoading: suggestionsLoading } = useConvexQuery(api.feed.getSuggestedUsers,  { limit: 5 });
  const { data: trendingPosts,  isLoading: trendingLoading }    = useConvexQuery(api.feed.getTrendingPosts,   { limit: 20 });
  const { data: trendingTags,   isLoading: tagsLoading }        = useConvexQuery(api.feed.getTrendingTags,    { limit: 12 });

  const { mutate: toggleFollow } = useConvexMutation(api.follows.toggleFollow);

  const handleFollowToggle = async (userId) => {
    if (!currentUser) { toast.error("Please sign in to follow users"); return; }
    try {
      await toggleFollow({ followingId: userId });
      toast.success("Follow status updated");
    } catch (err) {
      toast.error(err.message || "Failed to update follow status");
    }
  };

  // Category + tab filtering (client-side on fetched posts)
  const rawPosts = activeTab === "trending" ? (trendingPosts || []) : (feedData?.posts || []);
  const currentPosts = useMemo(() => {
    if (activeCategory === "All") return rawPosts;
    return rawPosts.filter((p) => p.category === activeCategory);
  }, [rawPosts, activeCategory]);

  const isLoading = feedLoading || (activeTab === "trending" && trendingLoading);

  return (
    <div className="min-h-screen bg-slate-900 text-white pt-32 pb-10">
      <ScrollToTop />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Feed Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold gradient-text-primary pb-2">
            Discover Amazing Content
          </h1>
          <p className="text-slate-400 mt-2">
            Explore posts from talented creators around the world
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
          {/* ── Main Feed Column ─────────────────────────────── */}
          <div className="lg:col-span-4 space-y-5">

            {/* Tab switcher */}
            <div className="flex space-x-2">
              <Button
                onClick={() => setActiveTab("feed")}
                variant={activeTab === "feed" ? "primary" : "ghost"}
                className="flex-1"
              >
                For You
              </Button>
              <Button
                onClick={() => setActiveTab("trending")}
                variant={activeTab === "trending" ? "primary" : "ghost"}
                className="flex-1"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Trending
              </Button>
            </div>

            {/* Category pills */}
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    activeCategory === cat
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700 hover:border-purple-500/40"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Create Post Prompt */}
            {currentUser && (
              <Link href="/dashboard/create">
                <div className="flex items-center space-x-3 p-3 rounded-xl border border-slate-700 hover:border-purple-500/50 bg-slate-800/40 hover:bg-slate-800/70 transition-all duration-200 group cursor-pointer">
                  <div className="relative w-10 h-10 flex-shrink-0">
                    {currentUser.imageUrl ? (
                      <Image
                        src={currentUser.imageUrl}
                        alt={currentUser.firstName || "User"}
                        fill
                        className="rounded-full object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-sm font-bold">
                        {(currentUser.firstName || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-slate-400 group-hover:text-slate-300 transition-colors text-sm">
                    What&apos;s on your mind? Share your thoughts...
                  </div>
                  <span className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 text-purple-300 group-hover:from-purple-600/30 group-hover:to-blue-600/30 transition-all">
                    Write
                  </span>
                </div>
              </Link>
            )}

            {/* Posts */}
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="card-glass rounded-xl h-64 animate-pulse" />
                ))}
              </div>
            ) : currentPosts.length === 0 ? (
              <Card className="card-glass">
                <CardContent className="text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                    {activeTab === "trending"
                      ? <TrendingUp className="h-8 w-8 text-purple-400" />
                      : <Sparkles className="h-8 w-8 text-purple-400" />}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {activeCategory !== "All"
                      ? `No ${activeCategory} posts yet`
                      : activeTab === "trending"
                        ? "No trending posts right now"
                        : "Your feed is empty"}
                  </h3>
                  <p className="text-slate-400 mb-6 max-w-sm mx-auto text-sm">
                    {activeCategory !== "All"
                      ? "Try a different category or check back later"
                      : activeTab === "trending"
                        ? "Check back soon — trending content updates frequently"
                        : "Follow some creators to fill your feed"}
                  </p>
                  {activeCategory !== "All" ? (
                    <Button variant="outline" size="sm" onClick={() => setActiveCategory("All")}>
                      Clear filter
                    </Button>
                  ) : activeTab !== "trending" && (
                    <Link href="/dashboard/create">
                      <Button variant="primary" size="sm">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Be the first to post
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {currentPosts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    showActions={false}
                    showAuthor={true}
                    className="max-w-none"
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Right Sidebar ─────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6 mt-14">

            {/* Trending Tags */}
            <Card className="card-glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center text-base">
                  <Hash className="h-4 w-4 mr-2 text-purple-400" />
                  Trending Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tagsLoading ? (
                  <div className="flex flex-wrap gap-2">
                    {[1,2,3,4,5,6].map(i => (
                      <div key={i} className="h-6 w-16 bg-slate-700 rounded-full animate-pulse" />
                    ))}
                  </div>
                ) : !trendingTags || trendingTags.length === 0 ? (
                  <p className="text-slate-400 text-sm">No trending tags yet</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {trendingTags.map(({ tag, count }) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setActiveCategory("All");
                          // filter by tag client-side is not wired in this iteration
                        }}
                        className="group flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-purple-500/20 border border-slate-700 hover:border-purple-500/40 transition-all"
                      >
                        <span className="text-xs text-slate-300 group-hover:text-purple-300">#{tag}</span>
                        <span className="text-[10px] text-slate-500 group-hover:text-purple-400">{count}</span>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Suggested Users */}
            <Card className="card-glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center text-base">
                  <Sparkles className="h-4 w-4 mr-2 text-purple-400" />
                  Suggested Creators
                </CardTitle>
              </CardHeader>
              <CardContent>
                {suggestionsLoading ? (
                  <div className="space-y-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="flex items-center gap-3 animate-pulse">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-slate-700 rounded w-24" />
                          <div className="h-2 bg-slate-700/70 rounded w-16" />
                        </div>
                        <div className="h-7 w-16 bg-slate-700 rounded-md" />
                      </div>
                    ))}
                  </div>
                ) : !suggestedUsers || suggestedUsers.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-3">No suggestions available</p>
                ) : (
                  <div className="space-y-4">
                    {suggestedUsers.map((user) => (
                      <div key={user._id}>
                        <div className="flex items-center justify-between gap-2">
                          <Link href={`/${user.username}`} className="flex items-center space-x-3 min-w-0 flex-1">
                            <div className="relative w-9 h-9 flex-shrink-0">
                              {user.imageUrl ? (
                                <Image src={user.imageUrl} alt={user.name} fill className="rounded-full object-cover" sizes="36px" />
                              ) : (
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-sm font-bold">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate">{user.name}</p>
                              <p className="text-xs text-slate-400 truncate">@{user.username}</p>
                            </div>
                          </Link>
                          <Button
                            onClick={() => handleFollowToggle(user._id)}
                            variant="outline"
                            size="sm"
                            className="border-purple-500/50 text-purple-400 hover:bg-purple-500 hover:text-white text-xs h-7 px-2 flex-shrink-0"
                          >
                            <UserPlus className="h-3 w-3 mr-1" />
                            Follow
                          </Button>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 pl-12">
                          {user.followerCount} followers · {user.postCount} posts
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
