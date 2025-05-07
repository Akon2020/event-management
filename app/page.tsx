import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CalendarDays, Mail, Users } from "lucide-react"
import EventList from "@/components/event-list"
import { getUpcomingEvents } from "@/lib/firebase/events"

// Remplacer la fonction Home par cette version avec plus de logs
export default async function Home() {
  console.log("Fetching events for home page...")
  const events = await getUpcomingEvents()
  console.log(
    `Rendering home page with ${events.length} events:`,
    events.map((e) => ({ id: e.id, title: e.title, date: e.date })),
  )

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Réservez votre place aux événements exclusifs
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mb-8">
          Découvrez nos événements à venir et réservez votre place en quelques clics. Recevez instantanément votre
          invitation personnalisée par email.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="gap-2">
            <Link href="#events">
              <CalendarDays className="h-5 w-5" />
              Voir les événements
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/auth/login">
              <Users className="h-5 w-5" />
              Espace administrateur
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <div className="bg-primary/5 rounded-lg p-6 flex flex-col items-center text-center">
          <CalendarDays className="h-12 w-12 text-primary mb-4" />
          <h3 className="text-xl font-medium mb-2">Événements exclusifs</h3>
          <p className="text-muted-foreground">Accédez à des événements uniques et exclusifs dans votre région.</p>
        </div>
        <div className="bg-primary/5 rounded-lg p-6 flex flex-col items-center text-center">
          <Mail className="h-12 w-12 text-primary mb-4" />
          <h3 className="text-xl font-medium mb-2">Invitations personnalisées</h3>
          <p className="text-muted-foreground">
            Recevez une invitation PDF élégante avec QR code directement dans votre boîte mail.
          </p>
        </div>
        <div className="bg-primary/5 rounded-lg p-6 flex flex-col items-center text-center">
          <Users className="h-12 w-12 text-primary mb-4" />
          <h3 className="text-xl font-medium mb-2">Newsletters</h3>
          <p className="text-muted-foreground">Soyez informé des nouveaux événements grâce à notre newsletter.</p>
        </div>
      </div>

      <section id="events" className="scroll-mt-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Événements à venir</h2>
        <EventList events={events} />
      </section>
    </div>
  )
}
