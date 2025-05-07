import { type NextRequest, NextResponse } from "next/server"
import { updateReservationStatus } from "@/lib/firebase/reservations"
import { getCurrentUser } from "@/lib/firebase/auth-server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated (admin only)
    const user = await getCurrentUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const reservationId = params.id

    // Update reservation status to attended
    await updateReservationStatus(reservationId, "attended")

    // Return success response
    return new NextResponse(JSON.stringify({ success: true, message: "Présence confirmée" }), {
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error confirming attendance:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
