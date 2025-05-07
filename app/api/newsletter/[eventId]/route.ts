import { type NextRequest, NextResponse } from "next/server"
import { sendNewsletterForEvent } from "@/lib/firebase/reservations"
import { getCurrentUser } from "@/lib/firebase/auth-server"

export async function POST(request: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    // Check if user is authenticated (admin only)
    const user = await getCurrentUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const eventId = params.eventId

    // Send newsletter to subscribers
    const sentCount = await sendNewsletterForEvent(eventId)

    // Return success response
    return new NextResponse(
      JSON.stringify({
        success: true,
        message: `Newsletter envoyée à ${sentCount} abonnés`,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("Error sending newsletter:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
