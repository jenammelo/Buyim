import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// 1. Define only the routes/pages that require a logged-in user
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/account(.*)',
  '/admin(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // 2. Only enforce authentication on protected routes.
  // Unmatched routes (like /api/inngest) will remain publicly accessible.
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Always run for Clerk-specific frontend API routes
    '/__clerk/(.*)',
  ],
}