-- ALD Immo - Schéma de base de données Supabase

-- Extension UUID
create extension if not exists "uuid-ossp";

-- Table: proprietaires
create table if not exists public.proprietaires (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  nom text not null,
  prenom text not null,
  email text not null unique,
  telephone text,
  adresse text,
  created_at timestamptz default now()
);

-- Table: biens
create table if not exists public.biens (
  id uuid primary key default uuid_generate_v4(),
  proprietaire_id uuid references public.proprietaires(id) on delete cascade not null,
  nom text not null,
  adresse text not null,
  type text check (type in ('appartement', 'villa', 'maison')) not null,
  chambres int default 1,
  capacite int default 2,
  prix_nuit decimal(10,2) default 0,
  statut text check (statut in ('actif', 'inactif')) default 'actif',
  created_at timestamptz default now()
);

-- Table: reservations
create table if not exists public.reservations (
  id uuid primary key default uuid_generate_v4(),
  bien_id uuid references public.biens(id) on delete cascade not null,
  proprietaire_id uuid references public.proprietaires(id) on delete cascade not null,
  locataire_nom text not null,
  locataire_email text,
  date_debut date not null,
  date_fin date not null,
  montant_total decimal(10,2) default 0,
  statut text check (statut in ('en_attente', 'confirme', 'check_in', 'check_out', 'annule')) default 'en_attente',
  plateforme text check (plateforme in ('airbnb', 'booking', 'direct')) default 'direct',
  created_at timestamptz default now()
);

-- Table: messages
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  proprietaire_id uuid references public.proprietaires(id) on delete cascade not null,
  expediteur text check (expediteur in ('proprietaire', 'ald')) not null,
  contenu text not null,
  lu boolean default false,
  created_at timestamptz default now()
);

-- Table: documents
create table if not exists public.documents (
  id uuid primary key default uuid_generate_v4(),
  proprietaire_id uuid references public.proprietaires(id) on delete cascade not null,
  bien_id uuid references public.biens(id) on delete set null,
  nom text not null,
  type text check (type in ('bilan', 'contrat', 'facture')) not null,
  url text not null,
  mois int check (mois between 1 and 12),
  annee int,
  created_at timestamptz default now()
);

-- RLS: activer pour toutes les tables
alter table public.proprietaires enable row level security;
alter table public.biens enable row level security;
alter table public.reservations enable row level security;
alter table public.messages enable row level security;
alter table public.documents enable row level security;

-- Politiques RLS: proprietaires voient uniquement leurs données

-- proprietaires
create policy "Proprietaires: voir ses propres données"
  on public.proprietaires for select
  using (auth.uid() = user_id);

create policy "Proprietaires: modifier ses propres données"
  on public.proprietaires for update
  using (auth.uid() = user_id);

-- biens
create policy "Biens: voir ses propres biens"
  on public.biens for select
  using (
    proprietaire_id in (
      select id from public.proprietaires where user_id = auth.uid()
    )
  );

create policy "Biens: modifier ses propres biens"
  on public.biens for update
  using (
    proprietaire_id in (
      select id from public.proprietaires where user_id = auth.uid()
    )
  );

-- reservations
create policy "Reservations: voir ses propres réservations"
  on public.reservations for select
  using (
    proprietaire_id in (
      select id from public.proprietaires where user_id = auth.uid()
    )
  );

-- messages
create policy "Messages: voir ses propres messages"
  on public.messages for select
  using (
    proprietaire_id in (
      select id from public.proprietaires where user_id = auth.uid()
    )
  );

create policy "Messages: envoyer un message"
  on public.messages for insert
  with check (
    proprietaire_id in (
      select id from public.proprietaires where user_id = auth.uid()
    )
  );

-- documents
create policy "Documents: voir ses propres documents"
  on public.documents for select
  using (
    proprietaire_id in (
      select id from public.proprietaires where user_id = auth.uid()
    )
  );

-- Données d'exemple

-- Propriétaires (sans user_id car pas de compte auth créé ici)
insert into public.proprietaires (id, nom, prenom, email, telephone, adresse) values
  ('11111111-1111-1111-1111-111111111111', 'Dupont', 'Jean', 'jean.dupont@email.com', '06 12 34 56 78', '12 rue des Pins, Gujan-Mestras'),
  ('22222222-2222-2222-2222-222222222222', 'Martin', 'Sophie', 'sophie.martin@email.com', '06 98 76 54 32', '5 allée des Mouettes, La Teste-de-Buch');

-- Biens
insert into public.biens (id, proprietaire_id, nom, adresse, type, chambres, capacite, prix_nuit, statut) values
  ('aaaa0000-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Villa Les Pins', '12 rue des Pins, Gujan-Mestras', 'villa', 4, 8, 250.00, 'actif'),
  ('bbbb0000-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Appartement Vue Mer', '3 avenue du Port, Arcachon', 'appartement', 2, 4, 120.00, 'actif'),
  ('cccc0000-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'Maison du Bassin', '5 allée des Mouettes, La Teste-de-Buch', 'maison', 3, 6, 180.00, 'actif');

-- Réservations
insert into public.reservations (bien_id, proprietaire_id, locataire_nom, locataire_email, date_debut, date_fin, montant_total, statut, plateforme) values
  ('aaaa0000-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Famille Bernard', 'bernard@email.com', '2024-07-01', '2024-07-08', 1750.00, 'check_out', 'airbnb'),
  ('aaaa0000-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Thomas Leblanc', 'thomas@email.com', '2024-07-15', '2024-07-22', 1750.00, 'check_out', 'booking'),
  ('bbbb0000-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Clara Fontaine', 'clara@email.com', '2024-08-01', '2024-08-10', 1080.00, 'check_out', 'airbnb'),
  ('bbbb0000-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Marc Girard', 'marc@email.com', '2024-08-20', '2024-08-27', 840.00, 'check_out', 'direct'),
  ('cccc0000-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'Isabelle Moreau', 'isabelle@email.com', '2024-07-10', '2024-07-17', 1260.00, 'check_out', 'booking'),
  ('cccc0000-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'Pierre Durand', 'pierre@email.com', '2024-08-05', '2024-08-12', 1260.00, 'check_out', 'airbnb'),
  ('aaaa0000-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Famille Petit', 'petit@email.com', '2024-12-20', '2024-12-27', 1750.00, 'confirme', 'airbnb'),
  ('bbbb0000-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Julie Roux', 'julie@email.com', '2024-12-26', '2025-01-02', 840.00, 'en_attente', 'direct'),
  ('cccc0000-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'Antoine Simon', 'antoine@email.com', '2024-12-28', '2025-01-04', 1260.00, 'confirme', 'booking'),
  ('aaaa0000-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Nathalie Blanc', 'nathalie@email.com', '2025-01-10', '2025-01-17', 1750.00, 'en_attente', 'airbnb');

-- Messages
insert into public.messages (proprietaire_id, expediteur, contenu, lu) values
  ('11111111-1111-1111-1111-111111111111', 'ald', 'Bonjour Jean, votre bilan du mois de juillet est disponible dans l''espace documents.', true),
  ('11111111-1111-1111-1111-111111111111', 'proprietaire', 'Merci ! J''ai bien reçu le bilan. Avez-vous des nouvelles pour la réservation de décembre ?', true),
  ('11111111-1111-1111-1111-111111111111', 'ald', 'Oui, la réservation de la Famille Petit est confirmée pour les fêtes de fin d''année.', false),
  ('22222222-2222-2222-2222-222222222222', 'ald', 'Bonjour Sophie, nous avons reçu une nouvelle demande de réservation pour votre bien Maison du Bassin.', false),
  ('22222222-2222-2222-2222-222222222222', 'proprietaire', 'Parfait, pouvez-vous me donner les détails ?', true);

-- Documents
insert into public.documents (proprietaire_id, bien_id, nom, type, url, mois, annee) values
  ('11111111-1111-1111-1111-111111111111', 'aaaa0000-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Bilan juillet 2024 - Villa Les Pins', 'bilan', 'https://example.com/docs/bilan-juillet-2024.pdf', 7, 2024),
  ('11111111-1111-1111-1111-111111111111', 'bbbb0000-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Bilan août 2024 - Appartement Vue Mer', 'bilan', 'https://example.com/docs/bilan-aout-2024.pdf', 8, 2024),
  ('11111111-1111-1111-1111-111111111111', null, 'Contrat de gestion 2024', 'contrat', 'https://example.com/docs/contrat-2024.pdf', null, 2024),
  ('22222222-2222-2222-2222-222222222222', 'cccc0000-cccc-cccc-cccc-cccccccccccc', 'Bilan juillet 2024 - Maison du Bassin', 'bilan', 'https://example.com/docs/bilan-maison-juillet-2024.pdf', 7, 2024),
  ('22222222-2222-2222-2222-222222222222', null, 'Facture commission juillet 2024', 'facture', 'https://example.com/docs/facture-juillet-2024.pdf', 7, 2024);
