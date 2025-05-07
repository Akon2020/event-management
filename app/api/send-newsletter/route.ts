import { type NextRequest, NextResponse } from "next/server"
import { getEvent } from "@/lib/firebase/events"
import { sendEmail } from "@/lib/email-service"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import type { Reservation } from "@/lib/types"
import { getCurrentUser } from "@/lib/firebase/auth-server"

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated (admin only)
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { eventId } = await request.json()

    // Get event details
    const event = await getEvent(eventId)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Get all users who opted in for newsletter
    const newsletterQuery = query(collection(db, "reservations"), where("newsletter", "==", true))
    const querySnapshot = await getDocs(newsletterQuery)

    const subscribers = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Reservation[]

    // Send newsletter to each subscriber
    const emailPromises = subscribers.map((subscriber) => {
      return sendEmail({
        to: subscriber.email,
        subject: `Nouvel événement: ${event.title}`,
        text: `Bonjour ${subscriber.name},\n\nNous sommes heureux de vous annoncer un nouvel événement: "${event.title}" qui aura lieu le ${new Date(event.date).toLocaleDateString("fr-FR")} à ${event.time} à ${event.location}.\n\nRéservez votre place dès maintenant sur notre site.\n\nÀ bientôt !`,
      })
    })

    await Promise.all(emailPromises)

    // Return success response
    return NextResponse.json({
      success: true,
      sentCount: subscribers.length,
      message: `Newsletter envoyée à ${subscribers.length} abonnés`,
    })
  } catch (error) {
    console.error("Error sending newsletter:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
