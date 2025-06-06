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
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import type { Event, EventStats } from "../types"

export async function createEvent(eventData: Omit<Event, "id">) {
  try {
    // Ajouter un timestamp serveur pour createdAt
    const dataWithTimestamp = {
      ...eventData,
      createdAt: serverTimestamp(),
    }

    // Vérifier que les données sont valides
    validateEventData(dataWithTimestamp)

    // Créer le document dans Firestore
    const eventsRef = collection(db, "events")
    const docRef = await addDoc(eventsRef, dataWithTimestamp)

    console.log("Event created with ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error creating event:", error)
    throw error
  }
}

// Fonction de validation des données d'événement
function validateEventData(data: any) {
  // Vérifier que les champs requis sont présents
  const requiredFields = ["title", "description", "date", "time", "location", "totalSpots", "availableSpots"]
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null) {
      throw new Error(`Missing required field: ${field}`)
    }
  }

  // Vérifier que les types de données sont corrects
  if (typeof data.title !== "string") throw new Error("Title must be a string")
  if (typeof data.description !== "string") throw new Error("Description must be a string")
  if (typeof data.time !== "string") throw new Error("Time must be a string")
  if (typeof data.location !== "string") throw new Error("Location must be a string")
  if (typeof data.totalSpots !== "number") throw new Error("Total spots must be a number")
  if (typeof data.availableSpots !== "number") throw new Error("Available spots must be a number")
}

export async function getEvent(id: string): Promise<Event | null> {
  try {
    const docRef = doc(db, "events", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      // Convertir les timestamps en strings si nécessaire
      return {
        id: docSnap.id,
        ...data,
        date: typeof data.date === "string" ? data.date : data.date.toDate().toISOString(),
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
      } as Event
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting event:", error)
    throw error
  }
}

export async function getAllEvents(): Promise<Event[]> {
  try {
    const eventsQuery = query(collection(db, "events"), orderBy("date", "desc"))
    const querySnapshot = await getDocs(eventsQuery)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      // Convertir les timestamps en strings si nécessaire
      return {
        id: doc.id,
        ...data,
        date: typeof data.date === "string" ? data.date : data.date.toDate().toISOString(),
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
      }
    }) as Event[]
  } catch (error) {
    console.error("Error getting all events:", error)
    return []
  }
}

// Remplacer la fonction getUpcomingEvents par cette version simplifiée et robuste
export async function getUpcomingEvents(): Promise<Event[]> {
  try {
    console.log("Fetching upcoming events...")
    // Récupérer tous les événements
    const eventsRef = collection(db, "events")
    const querySnapshot = await getDocs(eventsRef)

    console.log(`Found ${querySnapshot.docs.length} events in total`)

    if (querySnapshot.empty) {
      console.log("No events found in the database")
      return []
    }

    // Convertir les documents en objets Event
    const events = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      console.log(`Event ${doc.id}:`, data)

      // Normaliser les dates (gérer à la fois les strings et les timestamps)
      let eventDate: string
      if (typeof data.date === "string") {
        eventDate = data.date
      } else if (data.date && typeof data.date.toDate === "function") {
        eventDate = data.date.toDate().toISOString()
      } else {
        console.log(`Invalid date format for event ${doc.id}:`, data.date)
        eventDate = new Date().toISOString() // Fallback à aujourd'hui
      }

      return {
        id: doc.id,
        ...data,
        date: eventDate,
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toDate().toISOString()
            : data.createdAt || new Date().toISOString(),
      } as Event
    })

    // Filtrer les événements à venir
    const now = new Date()
    const upcomingEvents = events.filter((event) => {
      const eventDate = new Date(event.date)
      const isUpcoming = eventDate >= now
      console.log(`Event ${event.id} date: ${event.date}, is upcoming: ${isUpcoming}`)
      return isUpcoming
    })

    console.log(`Found ${upcomingEvents.length} upcoming events`)

    // Trier par date (du plus proche au plus éloigné)
    return upcomingEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  } catch (error) {
    console.error("Error getting upcoming events:", error)
    return []
  }
}

export async function updateEvent(id: string, eventData: Partial<Event>) {
  try {
    const docRef = doc(db, "events", id)

    // Supprimer l'ID et createdAt des données à mettre à jour
    const { id: _, createdAt, ...dataToUpdate } = eventData as any

    // Mettre à jour le document
    await updateDoc(docRef, dataToUpdate)
    console.log("Event updated successfully:", id)
    return true
  } catch (error) {
    console.error("Error updating event:", error)
    throw error
  }
}

export async function deleteEvent(id: string) {
  try {
    const docRef = doc(db, "events", id)
    await deleteDoc(docRef)
    console.log("Event deleted successfully:", id)
    return true
  } catch (error) {
    console.error("Error deleting event:", error)
    throw error
  }
}

export async function updateEventAvailableSpots(id: string, change: number) {
  try {
    const docRef = doc(db, "events", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const event = docSnap.data() as Event
      const newAvailableSpots = Math.max(0, Math.min(event.totalSpots, event.availableSpots + change))

      await updateDoc(docRef, {
        availableSpots: newAvailableSpots,
      })

      return newAvailableSpots
    }

    return null
  } catch (error) {
    console.error("Error updating event spots:", error)
    throw error
  }
}

export async function getEventStats(): Promise<EventStats> {
  try {
    const eventsSnapshot = await getDocs(collection(db, "events"))

    const now = new Date()

    const events = eventsSnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        date: typeof data.date === "string" ? data.date : data.date.toDate().toISOString(),
      }
    }) as Event[]

    const total = events.length
    const upcoming = events.filter((event) => new Date(event.date) >= now).length
    const past = total - upcoming

    return {
      total,
      upcoming,
      past,
    }
  } catch (error) {
    console.error("Error getting event stats:", error)
    return { total: 0, upcoming: 0, past: 0 }
  }
}
