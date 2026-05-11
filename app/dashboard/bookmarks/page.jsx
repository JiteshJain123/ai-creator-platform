"use client";

import React from "react";
import { Bookmark, Loader2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useConvexQuery } from "@/hooks/use-convex-query";
import PostCard from "@/components/post-card";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BookmarksPage() {
  const { data: bookmarks, isLoading } = useConvexQuery(api.bookmarks.getMyBookmarks);

  return (
    <div className="space-y-8 p-4 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text-primary flex items-center gap-3">
          <Bookmark className="h-8 w-8 text-purple-400" />
          Saved Posts
        </h1>
        <p className="text-slate-400 mt-2">Posts you've bookmarked for later reading</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto" />
            <p className="text-slate-400">Loading bookmarks...</p>
          </div>
        </div>
      ) : !bookmarks || bookmarks.length === 0 ? (
        <Card className="card-glass">
          <CardContent className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-5">
              <Bookmark className="h-8 w-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No bookmarks yet</h3>
            <p className="text-slate-400 mb-6 max-w-sm mx-auto">
              Save posts you want to read later — just tap the bookmark icon on any post.
            </p>
            <Link href="/feed">
              <Button variant="primary" size="sm">Explore the Feed</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {bookmarks.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              showActions={false}
              showAuthor={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
