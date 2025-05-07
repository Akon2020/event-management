"use client"

import { useState } from "react"
import type { Event } from "@/lib/types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, MapPin, Users } from "lucide-react"
import { formatDate } from "@/lib/utils"
import ReservationDialog from "./reservation-dialog"

interface EventListProps {
  events: Event[]
}

// Ajouter des logs de débogage au composant EventList
export default function EventList({ events }: EventListProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  console.log("EventList rendering with events:", events.length)

  const handleReserve = (event: Event) => {
    console.log("Reserving event:", event.id)
    setSelectedEvent(event)
    setIsDialogOpen(true)
  }

  if (events.length === 0) {
    console.log("No events to display")
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-2">Aucun événement à venir</h3>
        <p className="text-muted-foreground">Revenez bientôt pour découvrir nos prochains événements.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => {
          console.log(`Rendering event card for ${event.id}: ${event.title}`)
          return (
            <Card key={event.id} className="overflow-hidden flex flex-col">
              <div className="aspect-video bg-muted relative">
                {event.imageUrl ? (
                  <img
                    src={event.imageUrl || "/placeholder.svg"}
                    alt={event.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                    <CalendarDays className="h-12 w-12 text-primary/40" />
                  </div>
                )}
                {event.availableSpots === 0 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Badge variant="destructive" className="text-lg px-4 py-2">
                      Complet
                    </Badge>
                  </div>
                )}
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                  <Badge>{event.category}</Badge>
                </div>
                <CardDescription>{event.description.substring(0, 100)}...</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{event.availableSpots > 0 ? `${event.availableSpots} places disponibles` : "Complet"}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handleReserve(event)} disabled={event.availableSpots === 0}>
                  {event.availableSpots > 0 ? "Réserver" : "Complet"}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {selectedEvent && <ReservationDialog event={selectedEvent} open={isDialogOpen} onOpenChange={setIsDialogOpen} />}
    </>
  )
}
