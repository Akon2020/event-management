import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  // Supprimer le cookie de session
  cookies().set({
    name: "session",
    value: "",
    maxAge: 0,
    path: "/",
  })

  return NextResponse.json({ success: true })
}
