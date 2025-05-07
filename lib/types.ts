export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  category: string
  totalSpots: number
  availableSpots: number
  imageUrl: string | null
  createdAt: any // Peut être un timestamp Firestore ou une string
}

export interface Reservation {
  id: string
  eventId: string
  name: string
  email: string
  phone: string
  status: "pending" | "attended" | "cancelled"
  newsletter: boolean
  createdAt: string
}

export interface EventStats {
  total: number
  upcoming: number
  past: number
}

export interface ReservationStats {
  total: number
  pending: number
  attended: number
  cancelled: number
  newsletter: number
}
