"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Loader2, AlertCircle, FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { toast } from "sonner";

const usernameSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    ),
  bio: z.string().max(200, "Bio must be 200 characters or less").optional(),
});

export default function SettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data fetching
  const { data: currentUser, isLoading } = useConvexQuery(api.users.getCurrentUser);
  const updateUsername = useConvexMutation(api.users.updateUsername);
  const updateBio = useConvexMutation(api.users.updateBio);

  // Form setup
  const form = useForm({
    resolver: zodResolver(usernameSchema),
    defaultValues: {
      username: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = form;

  // Update form when user data loads
  useEffect(() => {
    if (currentUser) {
      reset({
        username: currentUser.username || "",
        bio: currentUser.bio || "",
      });
    }
  }, [currentUser, reset]);

  // Form submission
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const tasks = [updateUsername.mutate({ username: data.username })];
      if (data.bio !== undefined) tasks.push(updateBio.mutate({ bio: data.bio }));
      await Promise.all(tasks);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto" />
          <p className="text-slate-400 mt-4">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text-primary">Settings</h1>
        <p className="text-slate-400 mt-2">
          Manage your profile and account preferences
        </p>
      </div>

      {/* Profile Settings */}
      <Card className="card-glass max-w-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <User className="h-5 w-5 mr-2" />
            Public Profile
          </CardTitle>
          <CardDescription>
            How other creators see you on Creatr
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">Username</Label>
              <Input
                id="username"
                {...register("username")}
                placeholder="Enter your username"
                className="bg-slate-800 border-slate-600 text-white"
              />
              {currentUser?.username && (
                <div className="text-sm text-slate-400">
                  Your profile:{" "}
                  <span className="text-purple-400">creatr.app/@{currentUser.username}</span>
                </div>
              )}
              <div className="text-xs text-slate-500">
                3-20 characters · letters, numbers, underscores, hyphens only
              </div>
              {errors.username && (
                <p className="text-red-400 text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-white flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Bio
              </Label>
              <Textarea
                id="bio"
                {...register("bio")}
                placeholder="Tell the world a little about yourself..."
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 resize-none"
                rows={3}
                maxLength={200}
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>Shown on your public profile</span>
                <span>{(form.watch("bio") || "").length}/200</span>
              </div>
              {errors.bio && (
                <p className="text-red-400 text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.bio.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} variant="primary" className="w-full sm:w-auto">
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                ) : (
                  "Save Profile"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
