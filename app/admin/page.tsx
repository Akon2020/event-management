import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAllEvents, getEventStats } from "@/lib/firebase/events"
import { getAllReservations, getReservationStats } from "@/lib/firebase/reservations"
import AdminEventList from "@/components/admin/event-list"
import AdminReservationList from "@/components/admin/reservation-list"
import DashboardStats from "@/components/admin/dashboard-stats"
import { getCurrentUser } from "@/lib/firebase/auth-server"

export default async function AdminDashboard() {
  // Vérification de l'authentification
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Récupération des données
  const [events, reservations, eventStats, reservationStats] = await Promise.all([
    getAllEvents(),
    getAllReservations(),
    getEventStats(),
    getReservationStats(),
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tableau de bord administrateur</h1>

      <DashboardStats eventStats={eventStats} reservationStats={reservationStats} />

      <Tabs defaultValue="events" className="mt-8">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="events">Événements</TabsTrigger>
          <TabsTrigger value="reservations">Réservations</TabsTrigger>
        </TabsList>
        <TabsContent value="events">
          <AdminEventList events={events} />
        </TabsContent>
        <TabsContent value="reservations">
          <AdminReservationList reservations={reservations} events={events} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
