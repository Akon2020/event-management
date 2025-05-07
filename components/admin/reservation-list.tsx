"use client"

import { useState } from "react"
import type { Event, Reservation } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Download, Mail, Search, Ticket, X } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { updateReservationStatus } from "@/lib/firebase/reservations"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AdminReservationListProps {
  reservations: Reservation[]
  events: Event[]
}

export default function AdminReservationList({ reservations, events }: AdminReservationListProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [isSending, setIsSending] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [eventFilter, setEventFilter] = useState<string>("all")
  const { toast } = useToast()
  const router = useRouter()

  const eventMap = events.reduce(
    (acc, event) => {
      acc[event.id] = event
      return acc
    },
    {} as Record<string, Event>,
  )

  const handleUpdateStatus = async (id: string, status: "pending" | "attended" | "cancelled") => {
    setIsUpdating(id)
    try {
      await updateReservationStatus(id, status)
      toast({
        title: "Statut mis à jour",
        description: `Le statut de la réservation a été mis à jour avec succès.`,
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du statut.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsUpdating(null)
    }
  }

  const handleResendInvitation = async (reservationId: string) => {
    setIsSending(reservationId)
    try {
      const response = await fetch(`/api/send-invitation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reservationId }),
      })

      if (!response.ok) {
        throw new Error("Failed to send invitation")
      }

      toast({
        title: "Invitation envoyée",
        description: "L'invitation a été envoyée avec succès.",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de l'invitation.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsSending(null)
    }
  }

  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch =
      reservation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || reservation.status === statusFilter

    const matchesEvent = eventFilter === "all" || reservation.eventId === eventFilter

    return matchesSearch && matchesStatus && matchesEvent
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <h2 className="text-2xl font-bold">Réservations</h2>
        <div className="w-full md:w-auto flex flex-col md:flex-row gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="attended">Présent</SelectItem>
              <SelectItem value="cancelled">Annulé</SelectItem>
            </SelectContent>
          </Select>
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Événement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les événements</SelectItem>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredReservations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Ticket className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">Aucune réservation trouvée avec les filtres actuels.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredReservations.map((reservation) => {
            const event = eventMap[reservation.eventId]
            return (
              <Card key={reservation.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{reservation.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{reservation.email}</p>
                    </div>
                    <Badge
                      variant={
                        reservation.status === "attended"
                          ? "success"
                          : reservation.status === "cancelled"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {reservation.status === "pending"
                        ? "En attente"
                        : reservation.status === "attended"
                          ? "Présent"
                          : "Annulé"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Événement: {event ? event.title : "Événement inconnu"}</p>
                      <p className="text-sm text-muted-foreground">
                        {event ? `${formatDate(event.date)} à ${event.time}` : ""}
                      </p>
                      <p className="text-sm text-muted-foreground">Téléphone: {reservation.phone}</p>
                      <p className="text-sm text-muted-foreground">
                        Newsletter: {reservation.newsletter ? "Oui" : "Non"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResendInvitation(reservation.id)}
                        disabled={isSending === reservation.id}
                      >
                        {isSending === reservation.id ? (
                          "Envoi..."
                        ) : (
                          <>
                            <Mail className="h-4 w-4 mr-2" />
                            Renvoyer
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/api/invitations/${reservation.id}`} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </a>
                      </Button>
                      {reservation.status !== "attended" && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleUpdateStatus(reservation.id, "attended")}
                          disabled={isUpdating === reservation.id}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Marquer présent
                        </Button>
                      )}
                      {reservation.status !== "cancelled" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleUpdateStatus(reservation.id, "cancelled")}
                          disabled={isUpdating === reservation.id}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Annuler
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
