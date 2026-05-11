"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import {
  Eye,
  Heart,
  MessageCircle,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  ExternalLink,
  Copy,
  Bookmark,
  BookmarkCheck,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

const getReadingTime = (html) => {
  if (!html) return null;
  const words = html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

const getExcerpt = (html, maxLen = 120) => {
  if (!html) return "";
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > maxLen ? text.slice(0, maxLen).trimEnd() + "…" : text;
};

const PostCard = ({
  post,
  showActions = false,
  showAuthor = true,
  onEdit,
  onDelete,
  onDuplicate,
  className = "",
}) => {
  const { user: clerkUser } = useUser();

  const { data: isBookmarked } = useConvexQuery(
    api.bookmarks.hasBookmarked,
    clerkUser && post.status === "published" ? { postId: post._id } : "skip"
  );

  const { mutate: toggleBookmark } = useConvexMutation(api.bookmarks.toggleBookmark);

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!clerkUser) { toast.error("Sign in to bookmark posts"); return; }
    try {
      const result = await toggleBookmark({ postId: post._id });
      toast.success(result?.bookmarked ? "Bookmarked!" : "Bookmark removed");
    } catch { toast.error("Failed to update bookmark"); }
  };

  const getStatusBadge = (post) => {
    if (post.status === "published") {
      if (post.scheduledFor && post.scheduledFor > Date.now()) {
        return { variant: "secondary", className: "bg-blue-500/20 text-blue-300 border-blue-500/30", label: "Scheduled" };
      }
      return { variant: "default", className: "bg-green-500/20 text-green-300 border-green-500/30", label: "Published" };
    }
    return { variant: "outline", className: "bg-orange-500/20 text-orange-300 border-orange-500/30", label: "Draft" };
  };

  const getPostUrl = () => {
    if (post.status === "published" && (post.author?.username || post?.username)) {
      return `/${post.author?.username || post?.username}/${post._id}`;
    }
    return null;
  };

  const statusBadge = getStatusBadge(post);
  const publicUrl = getPostUrl();
  const excerpt = getExcerpt(post.content);
  const readTime = getReadingTime(post.content);
  const commentCount = post.commentCount ?? 0;

  return (
    <Card className={`card-glass hover:border-purple-500/50 transition-all duration-300 group ${className}`}>
      <CardContent className="p-0">
        {/* Featured Image */}
        <Link
          href={publicUrl || "#"}
          className={!publicUrl ? "pointer-events-none" : ""}
          target={publicUrl ? "_blank" : undefined}
        >
          <div className="relative w-full h-44 overflow-hidden rounded-t-xl">
            <Image
              src={post.featuredImage || "/placeholder.png"}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* Category badge overlay */}
            {post.category && (
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-black/60 backdrop-blur-sm text-white border border-white/10">
                  {post.category}
                </span>
              </div>
            )}
          </div>
        </Link>

        <div className="p-5 space-y-3">
          {/* Status + scheduled */}
          <div className="flex items-center gap-2">
            <Badge variant={statusBadge.variant} className={statusBadge.className}>
              {statusBadge.label}
            </Badge>
            {post.scheduledFor && post.scheduledFor > Date.now() && (
              <div className="flex items-center text-xs text-blue-400">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(post.scheduledFor).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Title + dropdown */}
          <div className="flex items-start justify-between gap-2">
            <Link
              href={publicUrl || "#"}
              className={!publicUrl ? "pointer-events-none flex-1" : "flex-1"}
              target={publicUrl ? "_blank" : undefined}
            >
              <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug">
                {post.title}
              </h3>
            </Link>

            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="flex-shrink-0 h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(post)}>
                      <Edit className="h-4 w-4 mr-2" />Edit Post
                    </DropdownMenuItem>
                  )}
                  {publicUrl && (
                    <DropdownMenuItem asChild>
                      <Link href={publicUrl} target="_blank">
                        <ExternalLink className="h-4 w-4 mr-2" />View Public
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {onDuplicate && (
                    <DropdownMenuItem onClick={() => onDuplicate(post)}>
                      <Copy className="h-4 w-4 mr-2" />Duplicate
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onDelete(post)} className="text-red-400 focus:text-red-400">
                        <Trash2 className="h-4 w-4 mr-2" />Delete Post
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Excerpt — only for feed posts */}
          {!showActions && excerpt && (
            <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">{excerpt}</p>
          )}

          {/* Author */}
          {showAuthor && post.author && (
            <Link href={`/${post.author.username}`} className="flex items-center space-x-2.5 w-fit hover:opacity-80 transition-opacity">
              <div className="relative w-7 h-7 flex-shrink-0">
                {post.author.imageUrl ? (
                  <Image src={post.author.imageUrl} alt={post.author.name} fill className="rounded-full object-cover" sizes="28px" />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-xs font-bold">
                    {post.author.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-white">{post.author.name}</p>
                {post.author.username && <p className="text-[10px] text-slate-500">@{post.author.username}</p>}
              </div>
            </Link>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-purple-500/15 text-purple-300 border-purple-500/25 text-[10px] px-2 py-0.5">
                  #{tag}
                </Badge>
              ))}
              {post.tags.length > 3 && (
                <Badge variant="secondary" className="bg-slate-500/15 text-slate-400 border-slate-500/25 text-[10px] px-2 py-0.5">
                  +{post.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Stats row */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {post.viewCount?.toLocaleString() || 0}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                {post.likeCount?.toLocaleString() || 0}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                {commentCount.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {readTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {readTime}m
                </span>
              )}

              {/* Bookmark — published posts only */}
              {post.status === "published" && clerkUser && (
                <button
                  onClick={handleBookmark}
                  className={`p-1 rounded transition-colors ${
                    isBookmarked ? "text-purple-400 hover:text-purple-300" : "text-slate-600 hover:text-slate-400"
                  }`}
                  title={isBookmarked ? "Remove bookmark" : "Bookmark"}
                >
                  {isBookmarked ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                </button>
              )}

              <time>
                {post.status === "published" && post.publishedAt
                  ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })
                  : formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true })}
              </time>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
