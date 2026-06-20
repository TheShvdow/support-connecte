-- ============================================================
-- Support Connecté — Schéma Supabase
-- Colle ce script dans l'éditeur SQL de ton projet Supabase
-- (Dashboard → SQL Editor → New query)
-- ============================================================

-- ── PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id         TEXT PRIMARY KEY,
  cat        TEXT NOT NULL,
  cat_en     TEXT NOT NULL,
  fr         TEXT NOT NULL,
  en         TEXT NOT NULL,
  price      TEXT,
  price_en   TEXT,
  d          TEXT,
  d_en       TEXT,
  color      TEXT,
  ico        TEXT,
  img        TEXT,
  avantages  JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── RÉALISATIONS
CREATE TABLE IF NOT EXISTS realisations (
  id         BIGSERIAL PRIMARY KEY,
  fr         TEXT NOT NULL,
  en         TEXT NOT NULL,
  cat        TEXT,
  color      TEXT,
  year       TEXT,
  img        TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── DEMANDES (devis)
CREATE TABLE IF NOT EXISTS demandes (
  id         BIGSERIAL PRIMARY KEY,
  ref        TEXT NOT NULL,
  client     TEXT NOT NULL,
  detail     TEXT,
  type       TEXT,
  date       TEXT,
  statut     TEXT DEFAULT 'Nouveau',
  notes      TEXT DEFAULT '',
  email      TEXT,
  tel        TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── CONTENUS (CMS)
CREATE TABLE IF NOT EXISTS contenus (
  id    TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body  JSONB
);

-- ── QR CODES dynamiques
CREATE TABLE IF NOT EXISTS qr_codes (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  destination TEXT NOT NULL,
  active      BOOLEAN DEFAULT TRUE,
  expires_at  DATE,
  created_at  DATE DEFAULT CURRENT_DATE,
  scans       INTEGER DEFAULT 0,
  max_scans   INTEGER NULL,
  style       JSONB DEFAULT '{}'
);

-- À exécuter si la table existe déjà :
-- ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS max_scans INTEGER NULL;

-- ── Fonction pour incrémenter les scans atomiquement
CREATE OR REPLACE FUNCTION increment_qr_scans(qr_id TEXT)
RETURNS VOID AS $$
  UPDATE qr_codes SET scans = scans + 1 WHERE id = qr_id;
$$ LANGUAGE SQL;

-- ============================================================
-- DONNÉES INITIALES
-- ============================================================

-- Contenus CMS
INSERT INTO contenus (id, title, body) VALUES
  ('hero',     'Accueil — Héro',  'De l''impression au digital, tout connecté. Une seule équipe pour tous vos besoins en communication visuelle et digitale.'),
  ('apropos',  'À propos',        'Support Connecté est une agence spécialisée en communication visuelle et digitale. Nos cinq pôles d''expertise couvrent l''intégralité de vos besoins.'),
  ('services', 'Services',        'Cinq pôles, une seule équipe : Impression & Signalétique, QR Code & Solutions, Digital & Créatif, Objets Publicitaires, Formation & IA.'),
  ('contact',  'Contact',         '{"email":"contact@supportconnecte.fr","phone":"+33 5 00 00 00 00","address":"12 rue de la Communication, 33000 Bordeaux","whatsapp":""}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Produits
INSERT INTO products (id, cat, cat_en, fr, en, price, price_en, d, d_en, color, ico, img, avantages) VALUES
  ('baches',        'Grand format', 'Large format',  'Bâches publicitaires', 'Advertising banners', 'dès 12 €/m²',  'from €12/m²',  'PVC haute résistance pour intérieur & extérieur.', 'High-resistance PVC for indoor & outdoor.', '#2347E6', '🏗️', 'https://images.unsplash.com/photo-1562832135-14a35d25edef?w=600&h=450&fit=crop&auto=format&q=80', '["Résistant aux UV et aux intempéries","Grande variété de formats","Pose rapide"]'),
  ('enseignes',     'Signalétique', 'Signage',       'Enseignes lumineuses',  'Illuminated signs',  'sur devis',     'on quote',     'LED, caissons lumineux, lettrage en relief.', 'LED, light boxes, raised lettering.', '#0FB57E', '💡', 'https://images.unsplash.com/photo-1535957998253-26ae1ef29506?w=600&h=450&fit=crop&auto=format&q=80', '["Visible jour & nuit","Longue durée de vie LED","Installation incluse"]'),
  ('rollup',        'PLV',          'POS display',   'Roll-up & Kakémono',    'Roll-up banners',    'dès 59 €',      'from €59',     'Structures légères, impression haute définition.', 'Lightweight structures, high-definition printing.', '#7C3AED', '📜', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=450&fit=crop&auto=format&q=80', '["Transport facile","Montage en 30 s","Formats standard ou sur-mesure"]'),
  ('stickers',      'Marquage',     'Marking',       'Stickers & Adhésifs',   'Stickers & Decals',  'dès 2 €',       'from €2',      'Découpe à forme, vitrophanie, covering partiel.', 'Die-cut, window film, partial covering.', '#FF5B35', '🔖', 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=450&fit=crop&auto=format&q=80', '["Repositionnable","Résistant à l''eau","Finition mate ou brillante"]'),
  ('affiche',       'Grand format', 'Large format',  'Affiches & Flyers',     'Posters & Flyers',   'dès 0,05 €',    'from €0.05',   'Impression offset ou numérique, grand tirage.', 'Offset or digital printing, large runs.', '#F5A524', '📄', 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=450&fit=crop&auto=format&q=80', '["Prix dégressifs","Livraison rapide","Papiers écologiques disponibles"]'),
  ('covering',      'Marquage',     'Marking',       'Covering véhicule',     'Vehicle wrap',       'sur devis',     'on quote',     'Covering total ou partiel, camionnette, voiture.', 'Full or partial wrap, van, car.', '#2347E6', '🚐', 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&h=450&fit=crop&auto=format&q=80', '["Publicité mobile permanente","Protège la carrosserie","Retrait sans traces"]'),
  ('qr-menu',       'QR Code',      'QR Code',       'QR Code Menu',          'QR Menu',            'dès 9 €/mois',  'from €9/mo',   'Menu numérique modifiable en temps réel.', 'Digital menu editable in real time.', '#0FB57E', '🍽️', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=450&fit=crop&auto=format&q=80', '["Mise à jour instantanée","Multilingue","Analytics inclus"]'),
  ('carte-nfc',     'QR Code',      'QR Code',       'Carte NFC digitale',    'NFC digital card',   'dès 29 €',      'from €29',     'Carte de visite connectée, partageable d''un geste.', 'Connected business card, shareable with a tap.', '#0FB57E', '💳', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=450&fit=crop&auto=format&q=80', '["Aucune app requise","Compatible iOS & Android","Design personnalisé"]'),
  ('logo',          'Digital',      'Digital',       'Création de logo',      'Logo design',        'dès 299 €',     'from €299',    'Identité visuelle complète, charte graphique.', 'Complete visual identity, brand guidelines.', '#7C3AED', '✦', 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&h=450&fit=crop&auto=format&q=80', '["3 propositions initiales","Révisions incluses","Fichiers vectoriels livrés"]'),
  ('goodies',       'Objets',       'Items',         'Goodies & Textile',     'Goodies & Apparel',  'sur devis',     'on quote',     'T-shirts, mugs, stylos, sacs — à votre image.', 'T-shirts, mugs, pens, bags — in your image.', '#FF5B35', '👕', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=450&fit=crop&auto=format&q=80', '["Personnalisation totale","Petites & grandes séries","Éco-responsable disponible"]'),
  ('formation-mkt', 'Formation',    'Training',      'Formation Marketing',   'Marketing training', 'dès 490 €/j',   'from €490/d',  'Réseaux sociaux, SEO, IA — formations opérationnelles.', 'Social media, SEO, AI — operational training.', '#F5A524', '🎓', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=450&fit=crop&auto=format&q=80', '["Format présentiel ou distanciel","Supports inclus","Certification possible"]')
ON CONFLICT (id) DO NOTHING;

-- QR Codes de démo
INSERT INTO qr_codes (id, name, destination, active, expires_at, scans, style) VALUES
  ('SC-A1B2C3', 'Menu — Restaurant Le Comptoir', 'https://supportconnecte.fr/demo/menu', true,  NULL,         234, '{"dotType":"rounded","cornerType":"extra-rounded","fgColor":"#2347E6","bgColor":"#FFFFFF","useGradient":false,"gradientColor":"#0FB57E","size":300,"margin":10}'),
  ('SC-D4E5F6', 'Stand — Salon Pro Nantes 2025', 'https://supportconnecte.fr/demo/salon', true,  '2025-09-30',  87, '{"dotType":"dots","cornerType":"dot","fgColor":"#0FB57E","bgColor":"#FFFFFF","useGradient":false,"gradientColor":"#2347E6","size":300,"margin":10}'),
  ('SC-G7H8I9', 'Carte NFC — Coach Bien-être',   'https://supportconnecte.fr/demo/coach', false, '2025-01-01',  12, '{"dotType":"classy","cornerType":"square","fgColor":"#7C3AED","bgColor":"#FFFFFF","useGradient":false,"gradientColor":"#FF5B35","size":300,"margin":10}')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- RLS (Row Level Security) — optionnel pour la démo
-- Désactive le RLS sur toutes les tables pour que l'app
-- puisse lire/écrire sans authentification Supabase.
-- Pour la production, configure un système d'auth.
-- ============================================================
ALTER TABLE products    DISABLE ROW LEVEL SECURITY;
ALTER TABLE realisations DISABLE ROW LEVEL SECURITY;
ALTER TABLE demandes    DISABLE ROW LEVEL SECURITY;
ALTER TABLE contenus    DISABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes    DISABLE ROW LEVEL SECURITY;
