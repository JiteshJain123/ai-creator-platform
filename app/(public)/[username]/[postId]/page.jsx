"use client";

import React, { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Eye,
  Heart,
  MessageCircle,
  Calendar,
  Send,
  Trash2,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

export default function PostDetailPage({ params }) {
  const { username, postId } = React.use(params);
  const { user: currentUser } = useUser();
  const [commentContent, setCommentContent] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Get post data
  const {
    data: post,
    isLoading: postLoading,
    error: postError,
  } = useConvexQuery(api.public.getPublishedPost, { username, postId });

  // Get comments
  const { data: comments, isLoading: commentsLoading } = useConvexQuery(
    api.comments.getPostComments,
    { postId }
  );

  // Get like status for current user
  const { data: hasLiked } = useConvexQuery(
    api.likes.hasUserLiked,
    currentUser ? { postId } : "skip"
  );

  // Mutations
  const toggleLike = useConvexMutation(api.likes.toggleLike);
  const addComment = useConvexMutation(api.comments.addComment);
  const deleteComment = useConvexMutation(api.comments.deleteComment);
  const incrementView = useConvexMutation(api.public.incrementViewCount);

  // Track view when post loads
  useEffect(() => {
    if (post && !postLoading) {
      incrementView.mutate({ postId });
    }
  }, [postLoading]);

  if (postLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading post...</p>
        </div>
      </div>
    );
  }

  if (postError || !post) {
    notFound();
  }

  const handleLikeToggle = async () => {
    if (!currentUser) {
      toast.error("Please sign in to like posts");
      return;
    }

    try {
      await toggleLike.mutate({ postId });
    } catch (error) {
      toast.error("Failed to update like");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error("Please sign in to comment");
      return;
    }

    if (!commentContent.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setIsSubmittingComment(true);

    try {
      await addComment.mutate({
        postId,
        content: commentContent.trim(),
      });
      setCommentContent("");
      toast.success("Comment added!");
    } catch (error) {
      toast.error(error.message || "Failed to add comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment.mutate({ commentId });
      toast.success("Comment deleted");
    } catch (error) {
      toast.error(error.message || "Failed to delete comment");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 sticky top-0 bg-slate-900/80 backdrop-blur-sm z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href={`/${username}`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
          <Link href={"/"} className="flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Creatr Logo"
              width={96}
              height={32}
              className="h-8 sm:h-10 md:h-11 w-auto object-contain"
            />
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <article className="space-y-8">
          {/* Featured Image */}
          {post.featuredImage && (
            <div className="relative w-full h-96 rounded-xl overflow-hidden">
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
                priority
              />
            </div>
          )}

          {/* Post Header */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold gradient-text-primary">
              {post.title}
            </h1>

            {/* Author and Meta */}
            <div className="flex items-center justify-between">
              <Link href={`/${username}`}>
                <div className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                  <div className="relative w-12 h-12">
                    {post.author.imageUrl ? (
                      <Image
                        src={post.author.imageUrl}
                        alt={post.author.name}
                        fill
                        className="rounded-full object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-lg font-bold">
                        {post.author.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {post.author.name}
                    </p>
                    <p className="text-sm text-slate-400">
                      @{post.author.username}
                    </p>
                  </div>
                </div>
              </Link>

              <div className="text-right text-sm text-slate-400">
                <div className="flex items-center gap-1 mb-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {post.viewCount.toLocaleString()} views
                </div>
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-purple-500/20 text-purple-300 border-purple-500/30"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Post Content */}
          <div
            className="prose prose-lg max-w-none prose-invert prose-purple"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Actions */}
          <div className="flex items-center gap-6 pt-4 border-t border-slate-800">
            <Button
              onClick={handleLikeToggle}
              variant="ghost"
              className={`flex items-center gap-2 ${
                hasLiked
                  ? "text-red-400 hover:text-red-300"
                  : "text-slate-400 hover:text-white"
              }`}
              disabled={toggleLike.isLoading}
            >
              <Heart className={`h-5 w-5 ${hasLiked ? "fill-current" : ""}`} />
              {post.likeCount.toLocaleString()}
            </Button>

            <div className="flex items-center gap-2 text-slate-400">
              <MessageCircle className="h-5 w-5" />
              {comments?.length || 0} comments
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold text-white">Comments</h2>

          {/* Add Comment Form */}
          {currentUser ? (
            <Card className="card-glass">
              <CardContent className="p-6">
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <Textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Write a comment..."
                    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 resize-none"
                    rows={3}
                    maxLength={1000}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      {commentContent.length}/1000 characters
                    </p>
                    <Button
                      type="submit"
                      disabled={isSubmittingComment || !commentContent.trim()}
                      variant="primary"
                    >
                      {isSubmittingComment ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Post Comment
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="card-glass">
              <CardContent className="p-6 text-center">
                <p className="text-slate-400 mb-4">
                  Sign in to join the conversation
                </p>
                <Link href="/sign-in">
                  <Button variant="primary">Sign In</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Comments List */}
          {commentsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-slate-400">Loading comments...</p>
            </div>
          ) : comments && comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <Card key={comment._id} className="card-glass">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-8 h-8">
                          {comment.author?.imageUrl ? (
                            <Image
                              src={comment.author.imageUrl}
                              alt={comment.author.name}
                              fill
                              className="rounded-full object-cover"
                              sizes="32px"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-sm font-bold">
                              {comment.author?.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {comment.author?.name || "Anonymous"}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(comment.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Delete button for comment author or post author */}
                      {currentUser &&
                        comment.author &&
                        (currentUser.id === comment.authorId ||
                          currentUser.id === post.authorId) && (
                          <Button
                            onClick={() => handleDeleteComment(comment._id)}
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                    </div>

                    <p className="text-slate-300 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="card-glass">
              <CardContent className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No comments yet</p>
                <p className="text-slate-500 text-sm mt-1">
                  Be the first to share your thoughts!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Custom prose styles */}
      <style jsx global>{`
        .prose-invert h1 {
          color: white;
          font-weight: 700;
          font-size: 2.5rem;
          margin: 1.5rem 0;
        }
        .prose-invert h2 {
          color: white;
          font-weight: 600;
          font-size: 2rem;
          margin: 1.25rem 0;
        }
        .prose-invert h3 {
          color: white;
          font-weight: 600;
          font-size: 1.5rem;
          margin: 1rem 0;
        }
        .prose-invert p {
          color: rgb(203, 213, 225);
          line-height: 1.7;
          margin: 1rem 0;
        }
        .prose-invert blockquote {
          border-left: 4px solid rgb(147, 51, 234);
          color: rgb(203, 213, 225);
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
        }
        .prose-invert a {
          color: rgb(147, 51, 234);
        }
        .prose-invert a:hover {
          color: rgb(168, 85, 247);
        }
        .prose-invert code {
          background: rgb(51, 65, 85);
          color: rgb(248, 113, 113);
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
        }
        .prose-invert pre {
          background: rgb(30, 41, 59);
          color: white;
          padding: 1rem;
          border-radius: 0.5rem;
          border: 1px solid rgb(71, 85, 105);
          overflow-x: auto;
        }
        .prose-invert ul,
        .prose-invert ol {
          color: rgb(203, 213, 225);
          padding-left: 1.5rem;
        }
        .prose-invert li {
          margin: 0.25rem 0;
        }
        .prose-invert img {
          border-radius: 0.5rem;
          margin: 1.5rem 0;
        }
        .prose-invert strong {
          color: white;
        }
        .prose-invert em {
          color: rgb(203, 213, 225);
        }
      `}</style>
    </div>
  );
}
