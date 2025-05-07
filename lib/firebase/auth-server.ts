import { cookies } from "next/headers"
import { initAdmin, adminAuth } from "./admin"

// Initialiser Firebase Admin
initAdmin()

export async function getCurrentUser() {
  // Utilisation asynchrone de cookies()
  const cookieStore = cookies()
  const session = cookieStore.get("session")?.value

  if (!session) {
    return null
  }

  try {
    // Utiliser adminAuth() au lieu de auth()
    const decodedToken = await adminAuth().verifySessionCookie(session, true)
    return decodedToken
  } catch (error) {
    console.error("Error verifying session cookie:", error)
    return null
  }
}
