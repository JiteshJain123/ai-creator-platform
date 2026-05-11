"use client";

import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar, UserPlus, UserMinus, FileText,
  Users, Eye, Heart, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import PostCard from "@/components/post-card";
import PublicHeader from "./_components/public-header";
import ScrollToTop from "@/components/scroll-to-top";

export default function ProfilePage({ params }) {
  const { username } = React.use(params);
  const { user: clerkUser } = useUser();

  const { data: profileUser, isLoading: userLoading } = useConvexQuery(
    api.users.getByUsername,
    { username }
  );

  const { data: postsData, isLoading: postsLoading } = useConvexQuery(
    api.public.getPublishedPostsByUsername,
    { username, limit: 20 }
  );

  const { data: isFollowing } = useConvexQuery(
    api.follows.isFollowing,
    profileUser ? { followingId: profileUser._id } : "skip"
  );

  const { mutate: toggleFollow, isLoading: followLoading } = useConvexMutation(
    api.follows.toggleFollow
  );

  const isOwnProfile = clerkUser && profileUser && clerkUser.id === profileUser.clerkId;

  const handleFollow = async () => {
    if (!clerkUser) { toast.error("Please sign in to follow creators"); return; }
    try {
      await toggleFollow({ followingId: profileUser._id });
      toast.success(isFollowing ? "Unfollowed" : "Now following!");
    } catch (err) {
      toast.error(err.message || "Failed to update follow status");
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-purple-400 mx-auto" />
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileUser) notFound();

  const posts = postsData?.posts || [];
  const totalViews = posts.reduce((s, p) => s + (p.viewCount || 0), 0);
  const totalLikes = posts.reduce((s, p) => s + (p.likeCount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <ScrollToTop />
      <PublicHeader link="/feed" title="Back to Feed" />

      {/* ── Hero Banner ──────────────────────────────────────── */}
      <div className="relative">
        <div className="h-52 sm:h-64 bg-gradient-to-br from-purple-900/80 via-blue-900/60 to-slate-900 overflow-hidden">
          {/* animated radial glows */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.35),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.25),transparent_55%)]" />
          {/* dot grid */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle,white 1px,transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        {/* Profile card overlapping banner */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="-mt-20 sm:-mt-24 pb-6 border-b border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              {/* Avatar + info */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                {/* Avatar */}
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex-shrink-0">
                  {profileUser.imageUrl ? (
                    <Image
                      src={profileUser.imageUrl}
                      alt={profileUser.name}
                      fill
                      className="rounded-2xl object-cover border-4 border-slate-900 shadow-2xl"
                      sizes="144px"
                    />
                  ) : (
                    <div className="w-full h-full rounded-2xl border-4 border-slate-900 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-5xl font-bold shadow-2xl">
                      {profileUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="pb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    {profileUser.name}
                  </h1>
                  <p className="text-slate-400 mt-0.5">@{profileUser.username}</p>

                  {profileUser.bio && (
                    <p className="text-slate-300 mt-2 max-w-md text-sm leading-relaxed">
                      {profileUser.bio}
                    </p>
                  )}

                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    Joined{" "}
                    {new Date(profileUser.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Action button */}
              <div className="flex-shrink-0">
                {isOwnProfile ? (
                  <Link href="/dashboard/settings">
                    <Button variant="outline" size="sm" className="border-slate-600 hover:border-purple-500">
                      Edit Profile
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={handleFollow}
                    disabled={followLoading || !clerkUser}
                    variant={isFollowing ? "outline" : "primary"}
                    size="sm"
                    className={isFollowing ? "border-slate-600 hover:border-red-500/60 hover:text-red-400" : ""}
                  >
                    {followLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isFollowing ? (
                      <><UserMinus className="h-4 w-4 mr-2" />Following</>
                    ) : (
                      <><UserPlus className="h-4 w-4 mr-2" />Follow</>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* ── Stats Row ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 stagger-children">
          {[
            { label: "Posts",     value: profileUser.postCount,              icon: FileText, color: "text-purple-400", bg: "bg-purple-500/10", border: "stat-card-blue" },
            { label: "Followers", value: profileUser.followerCount,           icon: Users,    color: "text-blue-400",   bg: "bg-blue-500/10",   border: "stat-card-blue" },
            { label: "Total Views",value: totalViews.toLocaleString(),        icon: Eye,      color: "text-green-400",  bg: "bg-green-500/10",  border: "stat-card-green" },
            { label: "Total Likes",value: totalLikes.toLocaleString(),        icon: Heart,    color: "text-red-400",    bg: "bg-red-500/10",    border: "stat-card-red" },
          ].map(({ label, value, icon: Icon, color, bg, border }) => (
            <div
              key={label}
              className={`card-glass ${border} rounded-xl p-4 flex items-center gap-3 animate-fade-in-up transition-all duration-300`}
            >
              <div className={`p-2 rounded-lg ${bg} flex-shrink-0`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div className="min-w-0">
                <div className="text-lg font-bold text-white truncate">{value}</div>
                <div className="text-xs text-slate-400">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Posts Grid ──────────────────────────────────────── */}
        <div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-400" />
            Published Posts
            {posts.length > 0 && (
              <span className="text-sm font-normal text-slate-400 ml-1">
                ({posts.length})
              </span>
            )}
          </h2>

          {postsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card-glass rounded-xl h-72 animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="card-glass rounded-2xl p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No posts yet</h3>
              <p className="text-slate-400 text-sm">
                {isOwnProfile
                  ? "You haven't published anything yet."
                  : `${profileUser.name} hasn't published anything yet.`}
              </p>
              {isOwnProfile && (
                <Link href="/dashboard/create" className="inline-block mt-5">
                  <Button variant="primary" size="sm">Write your first post</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  showActions={false}
                  showAuthor={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
