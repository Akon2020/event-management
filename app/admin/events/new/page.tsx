"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createEvent } from "@/lib/firebase/events"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { CalendarIcon } from "lucide-react"
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
  imageUrl: z.string().optional(),
})

type EventFormValues = z.infer<typeof eventSchema>

export default function NewEventPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      time: "",
      location: "",
      category: "",
      totalSpots: 50,
      imageUrl: "",
    },
  })

  // Modifier la fonction onSubmit pour ajouter des logs et s'assurer que les données sont correctement formatées
  const onSubmit = async (data: EventFormValues) => {
    setIsSubmitting(true)
    try {
      console.log("Submitting event data:", data)

      // Convertir la date en ISO string
      const eventData = {
        title: data.title,
        description: data.description,
        date: data.date.toISOString(),
        time: data.time,
        location: data.location,
        category: data.category,
        totalSpots: data.totalSpots,
        availableSpots: data.totalSpots,
        imageUrl: data.imageUrl || null,
      }

      console.log("Formatted event data:", eventData)
      const eventId = await createEvent(eventData)
      console.log("Event created with ID:", eventId)

      toast({
        title: "Événement créé",
        description: "L'événement a été créé avec succès.",
      })

      router.push("/admin")
      router.refresh()
    } catch (error) {
      console.error("Error creating event:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de l'événement.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Créer un nouvel événement</CardTitle>
          <CardDescription>Remplissez le formulaire pour créer un nouvel événement.</CardDescription>
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
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                          />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                <FormField
                  control={form.control}
                  name="totalSpots"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de places</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Création en cours..." : "Créer l'événement"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
