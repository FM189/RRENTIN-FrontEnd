import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const publicRoutes = [
  "/",
  "/service-provider/onboarding",
  "/api/health",
  "/api/auth",
];

const authRoutes = ["/login", "/signup"];

const roleRoutes: Record<string, string[]> = {
  tenant: ["/dashboard/tenant"],
  owner: ["/dashboard/owner"],
  service_provider: ["/dashboard/service-provider"],
  admin: ["/dashboard/admin"],
};

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

export default withAuth(
  function proxy(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    const isAuthRoute = authRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"));

    // Redirect logged-in users away from login/signup to dashboard
    if (token && isAuthRoute) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Allow unauthenticated users to access auth routes
    if (!token && isAuthRoute) {
      return NextResponse.next();
    }

    // Public routes — allow through
    if (isPublicRoute(pathname)) {
      return NextResponse.next();
    }

    // No token — redirect to login
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Role-based route protection for /dashboard sub-routes
    const role = token.role as string;

    // Check if the user is accessing another role's sub-routes
    for (const [routeRole, paths] of Object.entries(roleRoutes)) {
      if (routeRole !== role) {
        const isAccessingOtherRole = paths.some(
          (path) => pathname === path || pathname.startsWith(path + "/")
        );
        if (isAccessingOtherRole) {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const { pathname } = req.nextUrl;
        // Allow public and auth routes without token
        if (isPublicRoute(pathname) || authRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
          return true;
        }
        // Require token for everything else
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|icons).*)",
  ],
};
