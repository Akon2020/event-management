import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Mail, Ticket, Users } from "lucide-react"
import type { EventStats, ReservationStats } from "@/lib/types"

interface DashboardStatsProps {
  eventStats: EventStats
  reservationStats: ReservationStats
}

export default function DashboardStats({ eventStats, reservationStats }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Événements</CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{eventStats.total}</div>
          <p className="text-xs text-muted-foreground">{eventStats.upcoming} à venir</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Réservations</CardTitle>
          <Ticket className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{reservationStats.total}</div>
          <p className="text-xs text-muted-foreground">{reservationStats.pending} en attente</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taux de présence</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {reservationStats.total > 0 ? Math.round((reservationStats.attended / reservationStats.total) * 100) : 0}%
          </div>
          <p className="text-xs text-muted-foreground">
            {reservationStats.attended} présents sur {reservationStats.total}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Abonnés Newsletter</CardTitle>
          <Mail className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{reservationStats.newsletter}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((reservationStats.newsletter / reservationStats.total) * 100)}% des réservations
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
