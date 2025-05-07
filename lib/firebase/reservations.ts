import { db } from "./config"
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore"
import type { Reservation, ReservationStats } from "../types"
import { updateEventAvailableSpots } from "./events"

export async function createReservation(reservationData: Omit<Reservation, "id">) {
  // Start a transaction to update both the reservation and event spots
  const docRef = await addDoc(collection(db, "reservations"), reservationData)

  // Update available spots in the event
  await updateEventAvailableSpots(reservationData.eventId, -1)

  // Trigger the API to send the invitation
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-invitation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reservationId: docRef.id }),
    })
  } catch (error) {
    console.error("Error triggering invitation send:", error)
  }

  return docRef.id
}

export async function getReservation(id: string): Promise<Reservation | null> {
  const docRef = doc(db, "reservations", id)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Reservation
  } else {
    return null
  }
}

export async function getAllReservations(): Promise<Reservation[]> {
  const reservationsQuery = query(collection(db, "reservations"), orderBy("createdAt", "desc"))
  const querySnapshot = await getDocs(reservationsQuery)

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Reservation[]
}

export async function getReservationsByEvent(eventId: string): Promise<Reservation[]> {
  const reservationsQuery = query(
    collection(db, "reservations"),
    where("eventId", "==", eventId),
    orderBy("createdAt", "desc"),
  )

  const querySnapshot = await getDocs(reservationsQuery)

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Reservation[]
}

export async function updateReservationStatus(id: string, status: "pending" | "attended" | "cancelled") {
  const docRef = doc(db, "reservations", id)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    const reservation = docSnap.data() as Reservation
    const oldStatus = reservation.status

    // Update the reservation status
    await updateDoc(docRef, { status })

    // If cancelling a pending reservation, increase available spots
    if (oldStatus === "pending" && status === "cancelled") {
      await updateEventAvailableSpots(reservation.eventId, 1)
    }

    // If un-cancelling a reservation, decrease available spots
    if (oldStatus === "cancelled" && status === "pending") {
      await updateEventAvailableSpots(reservation.eventId, -1)
    }
  }
}

export async function deleteReservation(id: string) {
  const docRef = doc(db, "reservations", id)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    const reservation = docSnap.data() as Reservation

    // If the reservation was pending, increase available spots
    if (reservation.status === "pending") {
      await updateEventAvailableSpots(reservation.eventId, 1)
    }

    // Delete the reservation
    await deleteDoc(docRef)
  }
}

export async function getReservationStats(): Promise<ReservationStats> {
  const reservationsSnapshot = await getDocs(collection(db, "reservations"))

  const reservations = reservationsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Reservation[]

  const total = reservations.length
  const pending = reservations.filter((r) => r.status === "pending").length
  const attended = reservations.filter((r) => r.status === "attended").length
  const cancelled = reservations.filter((r) => r.status === "cancelled").length
  const newsletter = reservations.filter((r) => r.newsletter).length

  return {
    total,
    pending,
    attended,
    cancelled,
    newsletter,
  }
}

// Cette fonction est maintenant appelée uniquement côté serveur via l'API
export async function sendNewsletterForEvent(eventId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-newsletter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ eventId }),
    })

    if (!response.ok) {
      throw new Error("Failed to send newsletter")
    }

    const data = await response.json()
    return data.sentCount
  } catch (error) {
    console.error("Error sending newsletter:", error)
    throw error
  }
}
