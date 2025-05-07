import { type NextRequest, NextResponse } from "next/server"
import { getReservation } from "@/lib/firebase/reservations"
import { getEvent } from "@/lib/firebase/events"
import { generatePDF } from "@/lib/pdf-generator"
import { sendEmail } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { reservationId } = await request.json()

    // Get reservation data
    const reservation = await getReservation(reservationId)
    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 })
    }

    // Get event data
    const event = await getEvent(reservation.eventId)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Generate PDF
    const pdfBuffer = await generatePDF(reservation, event)

    // Send the email with the PDF attachment
    await sendEmail({
      to: reservation.email,
      subject: `Votre invitation: ${event.title}`,
      text: `Bonjour ${reservation.name},\n\nVoici votre invitation pour l'événement "${event.title}" qui aura lieu le ${new Date(event.date).toLocaleDateString("fr-FR")} à ${event.time} à ${event.location}.\n\nVeuillez trouver votre invitation en pièce jointe.\n\nÀ bientôt !`,
      attachments: [
        {
          filename: `invitation-${reservation.id}.pdf`,
          content: pdfBuffer,
        },
      ],
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending invitation:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
