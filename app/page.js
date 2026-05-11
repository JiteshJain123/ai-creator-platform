"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Star, CheckCircle, Zap, Globe, TrendingUp as TrendingUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  features,
  platformTabs,
  socialProofStats,
  testimonials,
} from "@/lib/data";
import Image from "next/image";
import Link from "next/link";

const Home = () => {
  const cursorRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);
  const [countedStats, setCountedStats] = useState({ creators: 0, posts: 0, readers: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX - 192}px`;
        cursorRef.current.style.top  = `${e.clientY - 192}px`;
      }
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Animate counters when section comes into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const duration = 2000;
          const targets = { creators: 50, posts: 2000, readers: 10000 };
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setCountedStats({
              creators: Math.floor(ease * targets.creators),
              posts: Math.floor(ease * targets.posts),
              readers: Math.floor(ease * targets.readers),
            });
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    const el = document.getElementById("stats-section");
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-green-900/20 animate-pulse" />

      {/* Dynamic cursor glow */}
      <div
        ref={cursorRef}
        className="fixed w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none z-0"
        style={{ transition: "left 0.3s ease-out, top 0.3s ease-out" }}
      />

      {/* Hero Section */}
      <section className="relative z-10 mt-44 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-400 pulse-ring inline-block" />
              10,000+ creators are live on Creatr right now
            </div>

            <div className="space-y-4 sm:space-y-6">
              <h1 className="text-7xl lg:text-8xl font-black leading-none tracking-tight">
                <span className="block font-black text-white">Create.</span>
                <span className="block font-light italic text-purple-300">Publish.</span>
                <span className="block font-black bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
                  Grow.
                </span>
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl text-gray-300 font-light leading-relaxed max-w-2xl md:max-w-none">
                The AI-powered platform that turns your ideas into{" "}
                <span className="text-purple-300 font-semibold">engaging content</span>{" "}
                and helps you build a thriving creator business.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center lg:items-start">
              <Link href="/dashboard">
                <Button size="xl" variant="primary" className="rounded-full w-full sm:w-auto text-white group">
                  Start Creating for Free
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/feed">
                <Button variant="outline" size="xl" className="rounded-full w-full sm:w-auto">
                  Explore the Feed
                </Button>
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 sm:gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[
                    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
                    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
                    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
                  ].map((src, i) => (
                    <div key={i} className="relative w-7 h-7 sm:w-8 sm:h-8">
                      <Image src={src} alt={`Creator ${i + 1}`} fill className="rounded-full border-2 border-black object-cover" sizes="32px" />
                    </div>
                  ))}
                </div>
                <span>10k+ creators</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-1">4.9/5</span>
              </div>
              <div className="flex items-center gap-1.5 text-green-400">
                <Zap className="w-4 h-4 fill-current" />
                <span>Free forever plan</span>
              </div>
            </div>
          </div>

          <div className="relative">
            {/* Floating accent cards */}
            <div className="absolute -left-6 top-8 z-10 hidden lg:block animate-bounce" style={{ animationDuration: "3s" }}>
              <div className="bg-purple-600/90 backdrop-blur-sm border border-purple-500/30 rounded-xl px-3 py-2 text-xs font-medium text-white shadow-lg">
                <div className="flex items-center gap-1.5">
                  <TrendingUpIcon className="h-3.5 w-3.5" />
                  +2,340 views today
                </div>
              </div>
            </div>
            <div className="absolute -right-4 bottom-12 z-10 hidden lg:block animate-bounce" style={{ animationDuration: "4s", animationDelay: "1s" }}>
              <div className="bg-blue-600/90 backdrop-blur-sm border border-blue-500/30 rounded-xl px-3 py-2 text-xs font-medium text-white shadow-lg">
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  Published to 40+ countries
                </div>
              </div>
            </div>

            <Image
              src="/banner.png"
              alt="Platform Banner"
              width={500}
              height={700}
              className="w-full h-auto object-contain relative z-0"
              priority
            />
          </div>
        </div>
      </section>

      {/* Animated stats */}
      <section id="stats-section" className="relative z-10 py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: `${countedStats.creators}K+`, label: "Active Creators", color: "from-purple-400 to-blue-400" },
              { value: `${countedStats.posts.toLocaleString()}+`, label: "Posts Published", color: "from-blue-400 to-cyan-400" },
              { value: `${countedStats.readers.toLocaleString()}+`, label: "Monthly Readers", color: "from-green-400 to-emerald-400" },
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <div className={`text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative mt-6 z-10 py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-r from-gray-900/50 to-purple-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <Badge className="bg-purple-500/10 text-purple-300 border-purple-500/30 mb-4">Features</Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6">
              <span className="gradient-text-primary">Everything you need</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto px-4">
              From AI-powered writing assistance to advanced analytics, we&apos;ve built the complete toolkit for modern creators.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group transition-all duration-300 hover:scale-105 hover:-translate-y-1 card-glass">
                <CardContent className="p-6 sm:p-8">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform shadow-lg`}>
                    <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl mb-3 text-white">{feature.title}</CardTitle>
                  <CardDescription className="text-sm sm:text-base text-gray-400 leading-relaxed">{feature.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Showcase */}
      <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="bg-blue-500/10 text-blue-300 border-blue-500/30 mb-4">How it works</Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6">
              <span className="gradient-text-primary">Three steps to success</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
              Three powerful modules working together to supercharge your content creation.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/3 space-y-3">
              {platformTabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 ${
                    activeTab === index
                      ? "bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/40 shadow-lg shadow-purple-500/10"
                      : "bg-slate-800/30 border-slate-700 hover:border-slate-600 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                      activeTab === index ? "bg-gradient-to-br from-purple-500 to-blue-500 shadow-md" : "bg-slate-700"
                    }`}>
                      <tab.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{tab.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {index === 0 ? "AI-assisted writing" : index === 1 ? "Grow your audience" : "Track your success"}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="lg:w-2/3">
              <Card className="bg-gray-900/70 border-gray-800 h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      {React.createElement(platformTabs[activeTab].icon, { className: "w-5 h-5 text-white" })}
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-white">{platformTabs[activeTab].title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-base text-gray-400 leading-relaxed">
                    {platformTabs[activeTab].description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {platformTabs[activeTab].features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-r from-gray-900/50 to-purple-900/20">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="bg-green-500/10 text-green-300 border-green-500/30 mb-4">Social Proof</Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-12 sm:mb-16">
            <span className="gradient-text-primary">Loved by creators worldwide</span>
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 lg:gap-8">
            {socialProofStats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/20">
                  <stat.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2 gradient-text-accent">{stat.metric}</div>
                <div className="text-gray-400 text-base sm:text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative z-10 py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="bg-yellow-500/10 text-yellow-300 border-yellow-500/30 mb-4">Testimonials</Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6">
              <span className="gradient-text-primary">What creators say</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1 card-glass">
                <CardContent className="p-8">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="mb-6 leading-relaxed text-gray-300 italic">&quot;{testimonial.content}&quot;</p>
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12">
                      <Image
                        src={`https://images.unsplash.com/photo-${testimonial.imageId}?w=100&h=100&fit=crop&crop=face`}
                        alt={testimonial.name}
                        fill
                        className="rounded-full border-2 border-purple-500/30 object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-gray-400 text-sm">{testimonial.role}</div>
                      <Badge variant="secondary" className="mt-1 bg-purple-500/10 text-purple-300 border-purple-500/20 text-xs">
                        {testimonial.company}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-purple-500/20 bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-slate-900 p-10 sm:p-16 text-center">
            {/* Background glows */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.3),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.2),transparent_60%)]" />

            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 sm:mb-8">
                <span className="gradient-text-primary">Ready to create?</span>
              </h2>
              <p className="text-xl text-gray-400 mb-8 sm:mb-12 max-w-2xl mx-auto">
                Join thousands of creators who are already building their audience and growing their business.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button size="xl" variant="primary" className="rounded-full text-white w-full group">
                    Start Your Journey Free
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/feed">
                  <Button variant="outline" size="xl" className="rounded-full w-full border-slate-600 hover:border-purple-500">
                    Explore the Feed
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-gray-500 mt-6">No credit card required · Free plan available · Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800/50 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            Made with ❤️ by <span className="text-foreground font-semibold">Jitesh</span>
          </p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/feed" className="hover:text-white transition-colors">Feed</Link>
            <Link href="/search" className="hover:text-white transition-colors">Search</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
