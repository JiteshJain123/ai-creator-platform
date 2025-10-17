import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";

import { Toaster } from "sonner";

import Header from "@/components/header";

import { ClerkProvider } from "@clerk/nextjs";

import { shadesOfPurple } from "@clerk/themes";

import { ConvexClientProvider } from "@/components/convex-client-provider";



export const metadata = {

  title: "AI Content Platform",

  description: "",

};



export default function RootLayout({ children }) {

  return (

    <html lang="en" suppressHydrationWarning>

      <head>{/* <link rel="icon" href="/logo-text.png" sizes="any" /> */}</head>

      <body

        className="font-sans bg-slate-900 text-white overflow-x-hidden min-h-screen"

        style={{

          fontFamily:

            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",

        }}

      >

        <ThemeProvider

          attribute="class"

          defaultTheme="dark"

          enableSystem

          disableTransitionOnChange

        >

          <ClerkProvider

            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}

            appearance={{

              baseTheme: shadesOfPurple,

            }}

          >

            <ConvexClientProvider>

              <Header />

              <main className="min-h-screen">

                <Toaster richColors />

                {children}

              </main>

            </ConvexClientProvider>

          </ClerkProvider>

        </ThemeProvider>

      </body>

    </html>

  );

}