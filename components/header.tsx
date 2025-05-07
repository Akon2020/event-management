"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/firebase/auth"
import { ModeToggle } from "./mode-toggle"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Header() {
  const { user, loading } = useAuth()
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      // Déconnexion de Firebase
      await fetch("/api/auth/logout", {
        method: "POST",
      })

      // Redirection vers la page d'accueil
      router.push("/")
      router.refresh()

      // Recharger la page pour effacer l'état de l'authentification
      window.location.reload()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          EventApp
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary">
              Accueil
            </Link>
            <Link href="/#events" className="text-sm font-medium hover:text-primary">
              Événements
            </Link>
            {user ? (
              <Link href="/admin" className="text-sm font-medium hover:text-primary">
                Administration
              </Link>
            ) : null}
          </nav>

          <div className="flex items-center gap-4">
            <ModeToggle />
            {!loading &&
              (user ? (
                <Button variant="outline" onClick={handleSignOut}>
                  Déconnexion
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/auth/login">Connexion</Link>
                </Button>
              ))}
          </div>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ModeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/" className="text-sm font-medium hover:text-primary" onClick={() => setOpen(false)}>
                  Accueil
                </Link>
                <Link href="/#events" className="text-sm font-medium hover:text-primary" onClick={() => setOpen(false)}>
                  Événements
                </Link>
                {user ? (
                  <Link href="/admin" className="text-sm font-medium hover:text-primary" onClick={() => setOpen(false)}>
                    Administration
                  </Link>
                ) : null}
                {!loading &&
                  (user ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleSignOut()
                        setOpen(false)
                      }}
                    >
                      Déconnexion
                    </Button>
                  ) : (
                    <Button asChild onClick={() => setOpen(false)}>
                      <Link href="/auth/login">Connexion</Link>
                    </Button>
                  ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
