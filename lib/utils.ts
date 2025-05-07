import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

export function generateQRCodeData(reservation: any, event: any): string {
  const data = {
    id: reservation.id,
    name: reservation.name,
    event: event.title,
    date: event.date,
    time: event.time,
    location: event.location,
    confirmationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/confirm/${reservation.id}`,
  }

  return JSON.stringify(data)
}
