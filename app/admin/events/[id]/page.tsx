"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { getEvent, updateEvent } from "@/lib/firebase/events"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn, formatDate } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const eventSchema = z.object({
  title: z.string().min(2, "Le titre est requis"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  date: z.date({
    required_error: "La date est requise",
  }),
  time: z.string().min(1, "L'heure est requise"),
  location: z.string().min(2, "Le lieu est requis"),
  category: z.string().min(1, "La catégorie est requise"),
  totalSpots: z.coerce.number().min(1, "Le nombre de places doit être supérieur à 0"),
  availableSpots: z.coerce.number().min(0, "Le nombre de places disponibles ne peut pas être négatif"),
  imageUrl: z.string().optional(),
})

type EventFormValues = z.infer<typeof eventSchema>

export default function EditEventPage({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const eventId = params.id

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      time: "",
      location: "",
      category: "",
      totalSpots: 0,
      availableSpots: 0,
      imageUrl: "",
    },
  })

  useEffect(() => {
    async function loadEvent() {
      try {
        const event = await getEvent(eventId)
        if (event) {
          form.reset({
            title: event.title,
            description: event.description,
            date: new Date(event.date),
            time: event.time,
            location: event.location,
            category: event.category,
            totalSpots: event.totalSpots,
            availableSpots: event.availableSpots,
            imageUrl: event.imageUrl || "",
          })
        } else {
          toast({
            title: "Erreur",
            description: "Événement non trouvé",
            variant: "destructive",
          })
          router.push("/admin")
        }
      } catch (error) {
        console.error("Error loading event:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger l'événement",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadEvent()
  }, [eventId, form, router, toast])

  const onSubmit = async (data: EventFormValues) => {
    setIsSubmitting(true)
    try {
      console.log("Updating event data:", data)

      // Convertir la date en ISO string
      const eventData = {
        title: data.title,
        description: data.description,
        date: data.date.toISOString(),
        time: data.time,
        location: data.location,
        category: data.category,
        totalSpots: data.totalSpots,
        availableSpots: data.availableSpots,
        imageUrl: data.imageUrl || null,
      }

      await updateEvent(eventId, eventData)

      toast({
        title: "Événement mis à jour",
        description: "L'événement a été mis à jour avec succès.",
      })

      router.push("/admin")
      router.refresh()
    } catch (error) {
      console.error("Error updating event:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de l'événement.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Modifier l'événement</CardTitle>
          <CardDescription>Modifiez les détails de l'événement.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre</FormLabel>
                    <FormControl>
                      <Input placeholder="Titre de l'événement" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Description de l'événement" className="min-h-[120px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? formatDate(field.value) : <span>Sélectionner une date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heure</FormLabel>
                      <FormControl>
                        <Input placeholder="19:00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lieu</FormLabel>
                    <FormControl>
                      <Input placeholder="Adresse de l'événement" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une catégorie" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Conférence">Conférence</SelectItem>
                          <SelectItem value="Atelier">Atelier</SelectItem>
                          <SelectItem value="Concert">Concert</SelectItem>
                          <SelectItem value="Exposition">Exposition</SelectItem>
                          <SelectItem value="Autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="totalSpots"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Places totales</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="availableSpots"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Places disponibles</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de l'image (optionnel)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Annuler
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Mise à jour en cours..." : "Mettre à jour l'événement"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
