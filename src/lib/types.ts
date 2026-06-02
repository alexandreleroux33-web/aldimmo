export type ReservationStatut = 'en_attente' | 'confirme' | 'check_in' | 'check_out' | 'annule'
export type BienType = 'appartement' | 'villa' | 'maison'
export type Plateforme = 'airbnb' | 'booking' | 'direct'
export type DocumentType = 'bilan' | 'contrat' | 'facture'
export type Expediteur = 'proprietaire' | 'ald'
export type BienStatut = 'actif' | 'inactif'

export interface Proprietaire {
  id: string
  user_id?: string
  nom: string
  prenom: string
  email: string
  telephone?: string
  adresse?: string
  created_at: string
}

export interface Bien {
  id: string
  proprietaire_id: string
  nom: string
  adresse: string
  type: BienType
  chambres: number
  capacite: number
  prix_nuit: number
  statut: BienStatut
  created_at: string
  proprietaires?: Proprietaire
}

export interface Reservation {
  id: string
  bien_id: string
  proprietaire_id: string
  locataire_nom: string
  locataire_email?: string
  date_debut: string
  date_fin: string
  montant_total: number
  statut: ReservationStatut
  plateforme: Plateforme
  created_at: string
  biens?: Bien
  proprietaires?: Proprietaire
}

export interface Message {
  id: string
  proprietaire_id: string
  expediteur: Expediteur
  contenu: string
  lu: boolean
  created_at: string
}

export interface Document {
  id: string
  proprietaire_id: string
  bien_id?: string
  nom: string
  type: DocumentType
  url: string
  mois?: number
  annee?: number
  created_at: string
  biens?: Bien
}
