Creatr
Creatr is a modern, full-stack AI-powered content creation platform designed for writers and creators. Built with Next.js, Convex, and Clerk, it provides a seamless experience for publishing articles, managing a following, and tracking content performance. The platform's core strength lies in its integrated AI tools, which assist creators in generating, refining, and enhancing their content from idea to publication.

🔗 Live Site & Repository
🌐 Live Demo: [YOUR_LIVE_DEMO_URL] <br /> 📁 GitHub Repo: [YOUR_GITHUB_REPO_URL]

⚙️ Tech Stack
Framework: Next.js

Backend & Database: Convex

Authentication: Clerk

Styling: Tailwind CSS (assumed from design)

Deployment: Vercel (assumed)

🚀 Core Features
Analytics Dashboard: Track total views, likes, comments, and follower growth with a visual overview and charts.

Full Post Management: Create, edit, publish, and manage all your articles from a central "My Posts" page.

Rich Text Editor: A complete WYSIWYG editor to easily format your content.

Social Connections: Follow other creators and manage your own list of followers and following.

Custom User Profiles: Set a unique username and manage your account preferences in the settings page.

Secure Authentication: User sign-up, sign-in, and profile management are handled securely by Clerk.

Search & Filtering: Easily find posts in your library by title or publication status.

🤖 AI-Powered Features
AI Content Generation: Generate post titles and story ideas directly within the editor to overcome writer's block.

Content Refinement Tools: Enhance, simplify, or expand your written text with a single click using powerful AI models.

AI Image Transformation: Upload a featured image for your post and transform it using AI to create unique visuals.

```
# Deployment used by `npx convex dev`
CONVEX_DEPLOYMENT=

NEXT_PUBLIC_CONVEX_URL=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

CLERK_JWT_ISSUER_DOMAIN=

# Imagekit
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=
IMAGEKIT_PRIVATE_KEY=

# Unsplash
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=

#Gemini
GEMINI_API_KEY=
```
