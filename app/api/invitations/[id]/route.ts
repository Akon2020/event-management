import { type NextRequest, NextResponse } from "next/server"
import { getReservation } from "@/lib/firebase/reservations"
import { getEvent } from "@/lib/firebase/events"
import { generatePDF } from "@/lib/pdf-generator"
import { getCurrentUser } from "@/lib/firebase/auth-server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated (admin only)
    const user = await getCurrentUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const reservationId = params.id

    // Get reservation data
    const reservation = await getReservation(reservationId)
    if (!reservation) {
      return new NextResponse("Reservation not found", { status: 404 })
    }

    // Get event data
    const event = await getEvent(reservation.eventId)
    if (!event) {
      return new NextResponse("Event not found", { status: 404 })
    }

    // Generate PDF
    const pdfBuffer = await generatePDF(reservation, event)

    // Return the PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invitation-${reservationId}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating invitation:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
