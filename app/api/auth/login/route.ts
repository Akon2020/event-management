import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { initAdmin, adminAuth } from "@/lib/firebase/admin"

// Initialiser Firebase Admin
initAdmin()

// Cette API route va créer un cookie de session après l'authentification Firebase
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()

    // Vérifier le token et créer un cookie de session
    const expiresIn = 60 * 60 * 24 * 5 * 1000 // 5 jours

    // Utiliser adminAuth() au lieu de auth()
    const sessionCookie = await adminAuth().createSessionCookie(idToken, { expiresIn })

    // Définir le cookie de session
    cookies().set({
      name: "session",
      value: sessionCookie,
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error creating session:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
