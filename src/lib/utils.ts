/** Formats a reservation amount. Returns "Prix non disponible" when amount
 *  is 0 and the reservation comes from an external iCal platform. */
export function formatMontant(montant: number, plateforme?: string): string {
  if (montant === 0 && plateforme && ['airbnb', 'booking'].includes(plateforme)) {
    return 'Prix non disponible'
  }
  return montant.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}
