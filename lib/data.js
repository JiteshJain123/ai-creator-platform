import {
  Users,
  BarChart3,
  Mail,
  PenTool,
  Eye,
  Calendar,
  Heart,
  Shield,
  Target,
  TrendingUp,
  DollarSign,
  LucideMessagesSquare,
} from "lucide-react";

export const floatingElements = [
  {
    icon: LucideMessagesSquare,
    size: "w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24",
    color: "from-purple-500 to-blue-500",
    position: "top-0 left-0",
    rotation: "rotate-12",
    delay: 0,
  },
  {
    icon: PenTool,
    size: "w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16",
    color: "from-green-500 to-blue-500",
    position: "top-8 sm:top-12 right-0",
    rotation: "",
    delay: 1,
  },
  {
    icon: BarChart3,
    size: "w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20",
    color: "from-yellow-500 to-orange-500",
    position: "bottom-0 left-8 sm:left-12",
    rotation: "-rotate-12",
    delay: 2,
  },
  {
    icon: Heart,
    size: "w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14",
    color: "from-pink-500 to-purple-500",
    position: "bottom-8 sm:bottom-12 right-6 sm:right-8",
    rotation: "rotate-45",
    delay: 3,
  },
];

export const features = [
  {
    icon: PenTool,
    title: "AI Writing Assistant",
    desc: "Get smart suggestions for titles, content, and SEO optimization",
    color: "from-purple-500 to-blue-500",
  },
  {
    icon: Users,
    title: "Community Building",
    desc: "Grow your audience with followers, comments, and engagement tools",
    color: "from-green-500 to-yellow-500",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    desc: "Track performance with detailed view counts and engagement metrics",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Mail,
    title: "Email Campaigns",
    desc: "Build and nurture your subscriber list with automated newsletters",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Calendar,
    title: "Content Scheduling",
    desc: "Plan and schedule your content with real-time updates",
    color: "from-red-500 to-purple-500",
  },
  {
    icon: Target,
    title: "Smart Targeting",
    desc: "AI-powered audience insights and content recommendation engine",
    color: "from-emerald-500 to-green-500",
  },
];

export const socialProofStats = [
  { metric: "50K+", label: "Active Creators", icon: Users },
  { metric: "2M+", label: "Published Posts", icon: PenTool },
  { metric: "10M+", label: "Monthly Readers", icon: Eye },
  { metric: "99.9%", label: "Uptime", icon: Shield },
];

export const testimonials = [
  {
    name: "Sarah Chen",
    role: "Tech Blogger",
    company: "@TechInsights",
    imageId: "1580489944761-15a19d654956",
    content:
      "AI Creator Platform transformed how I create content. The AI writing assistant saves me hours every week.",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Newsletter Creator",
    company: "@MarketingWeekly",
    imageId: "1507003211169-0a1dd7228f2d",
    content:
      "The email newsletter features are incredible. My subscriber growth increased by 300% in just 3 months.",
    rating: 5,
  },
  {
    name: "Elena Rodriguez",
    role: "Content Strategist",
    company: "@CreativeSpace",
    imageId: "1544005313-94ddf0286df2",
    content:
      "Best investment I've made for my content business. The analytics help me understand what my audience loves.",
    rating: 5,
  },
];

export const platformTabs = [
  {
    title: "Content Creation",
    icon: PenTool,
    description:
      "AI-powered writing tools that help you create engaging content faster than ever before.",
    features: [
      "Smart title suggestions",
      "Content optimization",
      "SEO recommendations",
      "Plagiarism detection",
    ],
  },
  {
    title: "Audience Growth",
    icon: TrendingUp,
    description:
      "Build and engage your community with powerful audience management tools.",
    features: [
      "Follower analytics",
      "Engagement tracking",
      "Community insights",
      "Growth recommendations",
    ],
  },
  {
    title: "Monetization",
    icon: DollarSign,
    description:
      "Turn your content into revenue with multiple monetization strategies.",
    features: [
      "Subscription tiers",
      "Pay-per-post",
      "Affiliate integration",
      "Revenue analytics",
    ],
  },
];
