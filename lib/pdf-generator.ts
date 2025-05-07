import type { Reservation, Event } from "./types"
import { generateQRCodeData } from "./utils"

// Cette fonction sera uniquement appelée côté serveur
export async function generatePDF(reservation: Reservation, event: Event): Promise<Buffer> {
  // Importation dynamique pour éviter l'erreur côté client
  const PDFDocument = (await import("pdfkit")).default
  const QRCode = await import("qrcode")

  return new Promise(async (resolve, reject) => {
    try {
      // Generate QR code
      const qrCodeData = generateQRCodeData(reservation, event)
      const qrCodeImage = await QRCode.toDataURL(qrCodeData)

      // Create a PDF document
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
      })

      // Collect the PDF data in a buffer
      const buffers: Buffer[] = []
      doc.on("data", buffers.push.bind(buffers))
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers)
        resolve(pdfData)
      })

      // Add content to the PDF
      doc.fontSize(25).text("Invitation", { align: "center" })
      doc.moveDown()

      // Event details
      doc.fontSize(16).text(event.title, { align: "center" })
      doc.moveDown()

      doc.fontSize(12).text(`Date: ${new Date(event.date).toLocaleDateString("fr-FR")}`, { align: "center" })
      doc.fontSize(12).text(`Heure: ${event.time}`, { align: "center" })
      doc.fontSize(12).text(`Lieu: ${event.location}`, { align: "center" })
      doc.moveDown()

      // Reservation details
      doc.fontSize(14).text(`Réservé pour: ${reservation.name}`, { align: "center" })
      doc.moveDown(2)

      // Add QR code
      doc.image(qrCodeImage, {
        fit: [250, 250],
        align: "center",
        valign: "center",
      })
      doc.moveDown()

      doc.fontSize(10).text("Présentez ce QR code à l'entrée de l'événement.", { align: "center" })
      doc.moveDown(2)

      // Add footer
      doc.fontSize(10).text("Cette invitation est personnelle et ne peut être transférée.", { align: "center" })

      // Finalize the PDF
      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}
