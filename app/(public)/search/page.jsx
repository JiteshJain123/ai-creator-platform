"use client";

import React, { useState, useMemo, Suspense } from "react";
import { Search, Loader2, FileSearch, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { useConvexQuery } from "@/hooks/use-convex-query";
import PostCard from "@/components/post-card";
import ScrollToTop from "@/components/scroll-to-top";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const CATEGORIES = [
  "All", "Technology", "Design", "Marketing", "Business",
  "Lifestyle", "Education", "Health", "Travel", "Food", "Entertainment",
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [debouncedQuery, setDebouncedQuery] = useState(searchParams.get("q") || "");
  const [activeCategory, setActiveCategory] = useState("All");

  // Debounce input
  const handleInput = (value) => {
    setQuery(value);
    clearTimeout(window._searchTimer);
    window._searchTimer = setTimeout(() => {
      setDebouncedQuery(value);
      if (value.trim()) {
        router.replace(`/search?q=${encodeURIComponent(value)}`, { scroll: false });
      } else {
        router.replace("/search", { scroll: false });
      }
    }, 350);
  };

  const { data: results = [], isLoading } = useConvexQuery(
    api.posts.searchPosts,
    debouncedQuery.trim() ? { query: debouncedQuery.trim(), limit: 30 } : "skip"
  );

  const filteredResults = useMemo(() => {
    if (activeCategory === "All") return results;
    return results.filter((p) => p.category === activeCategory);
  }, [results, activeCategory]);

  const hasQuery = debouncedQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-slate-900 text-white pt-28 pb-16">
      <ScrollToTop />
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm mb-4">
            <FileSearch className="h-4 w-4" />
            Discover Content
          </div>
          <h1 className="text-4xl sm:text-5xl font-black gradient-text-primary pb-2">
            Search Posts
          </h1>
          <p className="text-slate-400 mt-2">Find articles, guides, and stories from creators</p>
        </div>

        {/* Search bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="Search for posts..."
            className="pl-12 pr-4 h-14 text-base bg-slate-800/80 border-slate-600 focus:border-purple-500/60 rounded-2xl text-white placeholder:text-slate-500"
            autoFocus
          />
          {isLoading && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400 animate-spin" />
          )}
        </div>

        {/* Category pills */}
        {hasQuery && (
          <div className="flex gap-2 flex-wrap mb-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        {!hasQuery ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Start searching</h3>
            <p className="text-slate-400 max-w-sm mx-auto">
              Type in the search box above to find posts from creators around the world.
            </p>
            <div className="mt-6">
              <Link href="/feed">
                <Button variant="outline" size="sm" className="border-slate-600 hover:border-purple-500">
                  Browse Feed Instead
                </Button>
              </Link>
            </div>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card-glass rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700/50 to-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-5">
              <FileSearch className="h-8 w-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
            <p className="text-slate-400 mb-4">
              {activeCategory !== "All"
                ? `No ${activeCategory} posts match "${debouncedQuery}"`
                : `No posts match "${debouncedQuery}"`}
            </p>
            {activeCategory !== "All" && (
              <Button variant="outline" size="sm" onClick={() => setActiveCategory("All")}>
                Clear category filter
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-slate-400">
                <span className="text-white font-medium">{filteredResults.length}</span> result{filteredResults.length !== 1 ? "s" : ""} for
                {" "}<span className="text-purple-300">"{debouncedQuery}"</span>
                {activeCategory !== "All" && ` in ${activeCategory}`}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredResults.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  showActions={false}
                  showAuthor={true}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
