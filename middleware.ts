import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Vérifier si l'utilisateur est authentifié pour les routes admin
  const session = request.cookies.get("session")

  // Si l'utilisateur tente d'accéder à une route admin sans être authentifié
  if (request.nextUrl.pathname.startsWith("/admin") && !session) {
    // Rediriger vers la page de connexion
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
