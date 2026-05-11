"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Sparkles, Loader2 } from "lucide-react";
import { suggestTags } from "@/app/actions/gemini";
import { toast } from "sonner";

const CATEGORIES = [
  "Technology",
  "Design",
  "Marketing",
  "Business",
  "Lifestyle",
  "Education",
  "Health",
  "Travel",
  "Food",
  "Entertainment",
];

export default function PostEditorSettings({ isOpen, onClose, form, mode }) {
  const [tagInput, setTagInput] = useState("");
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  const { watch, setValue } = form;
  const watchedValues = watch();

  const handleSuggestTags = async () => {
    if (!watchedValues.title?.trim()) {
      toast.error("Add a title before suggesting tags");
      return;
    }
    setIsSuggestingTags(true);
    try {
      const result = await suggestTags(watchedValues.title, watchedValues.content || "");
      if (result.success) {
        const newTags = result.tags.filter((t) => !watchedValues.tags.includes(t));
        const merged = [...watchedValues.tags, ...newTags].slice(0, 10);
        setValue("tags", merged);
        toast.success(`Added ${newTags.length} AI-suggested tag${newTags.length !== 1 ? "s" : ""}!`);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to suggest tags");
    } finally {
      setIsSuggestingTags(false);
    }
  };

  const handleTagInput = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (
      tag &&
      !watchedValues.tags.includes(tag) &&
      watchedValues.tags.length < 10
    ) {
      setValue("tags", [...watchedValues.tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setValue(
      "tags",
      watchedValues.tags.filter((tag) => tag !== tagToRemove)
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Post Settings</DialogTitle>
          <DialogDescription>Configure your post details</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Category */}
          <div className="space-y-2">
            <label className="text-white text-sm font-medium">Category</label>
            <Select
              value={watchedValues.category}
              onValueChange={(value) => setValue("category", value)}
            >
              <SelectTrigger className="bg-slate-800 border-slate-600">
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-white text-sm font-medium">Tags</label>
              <Button
                type="button"
                onClick={handleSuggestTags}
                disabled={isSuggestingTags || !watchedValues.title?.trim()}
                variant="ghost"
                size="sm"
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 text-xs h-7 px-2"
              >
                {isSuggestingTags ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3 mr-1" />
                )}
                AI Suggest
              </Button>
            </div>
            <div className="flex space-x-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInput}
                placeholder="Add tags..."
                className="bg-slate-800 border-slate-600"
              />
              <Button
                type="button"
                onClick={addTag}
                variant="outline"
                size="sm"
                className="border-slate-600"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {watchedValues.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {watchedValues.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-purple-500/20 text-purple-300 border-purple-500/30"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <p className="text-xs text-slate-400">
              {watchedValues.tags.length}/10 tags • Press Enter or comma to add
            </p>
          </div>

          {/* Scheduling */}
          {mode === "create" && (
            <div className="space-y-2">
              <label className="text-white text-sm font-medium">
                Schedule Publication
              </label>
              <Input
                value={watchedValues.scheduledFor}
                onChange={(e) => setValue("scheduledFor", e.target.value)}
                type="datetime-local"
                className="bg-slate-800 border-slate-600"
                min={new Date().toISOString().slice(0, 16)}
              />
              <p className="text-xs text-slate-400">
                Leave empty to publish immediately
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
