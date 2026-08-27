import { SectorDefinition, SectorType } from '../types';

export const SECTORS_LIST: SectorDefinition[] = [
  {
    id: 'Cafe',
    labelFR: 'Café',
    labelAR: 'مقهى',
    labelEN: 'Café',
    icon: 'Coffee',
    defaultCategories: ['Café', 'Thé / Tisanes', 'Jus & Smoothies', 'Boissons Gazeuses', 'Pâtisseries & Boulange', 'Terrasse'],
    suggestedStock: [
      { name: 'Café en grains (Grains)', unit: 'kg', minStock: 10, unitCost: 110 },
      { name: 'Lait Entier', unit: 'Litre', minStock: 30, unitCost: 8.5 },
      { name: 'Sucre Blanc Sac', unit: 'kg', minStock: 15, unitCost: 7.5 },
      { name: 'Feuilles de menthe fraîche', unit: 'Botte', minStock: 10, unitCost: 2 },
      { name: 'Gobelets à emporter', unit: 'Unités', minStock: 200, unitCost: 0.8 },
      { name: 'Eau Minérale 50cl', unit: 'Bouteilles', minStock: 120, unitCost: 2.2 }
    ]
  },
  {
    id: 'Restaurant',
    labelFR: 'Restaurant',
    labelAR: 'مطعم',
    labelEN: 'Restaurant',
    icon: 'Utensils',
    defaultCategories: ['Plats Principaux', 'Entrées / Salades', 'Desserts', 'Boissons', 'Livraison', 'Événements'],
    suggestedStock: [
      { name: 'Filet de bœuf de l\'Atlas', unit: 'kg', minStock: 15, unitCost: 120 },
      { name: 'Poulet entier nettoyé', unit: 'kg', minStock: 25, unitCost: 38 },
      { name: 'Huile de cuisson sac', unit: 'Litre', minStock: 40, unitCost: 17 },
      { name: 'Riz Basmati importé', unit: 'kg', minStock: 20, unitCost: 22 },
      { name: 'Légumes de saison (Marché)', unit: 'kg', minStock: 50, unitCost: 6 },
      { name: 'Emballages de livraison', unit: 'Unités', minStock: 150, unitCost: 1.5 }
    ]
  },
  {
    id: 'Boulangerie',
    labelFR: 'Boulangerie / Pâtisserie',
    labelAR: 'مخبزة وحلويات',
    labelEN: 'Bakery / Pastry',
    icon: 'Croissant',
    defaultCategories: ['Pains Classiques', 'Viennoiseries', 'Pâtisseries Marocaines', 'Gâteaux d\'Anniversaire', 'Salon de thé'],
    suggestedStock: [
      { name: 'Farine de Blé T55', unit: 'kg', minStock: 100, unitCost: 6.5 },
      { name: 'Beurre Doux professionnel', unit: 'kg', minStock: 20, unitCost: 85 },
      { name: 'Levure boulangère fraîche', unit: 'kg', minStock: 5, unitCost: 28 },
      { name: 'Amandes décortiquées (Taroudant)', unit: 'kg', minStock: 12, unitCost: 95 },
      { name: 'Chocolat de couverture 55%', unit: 'kg', minStock: 15, unitCost: 75 }
    ]
  },
  {
    id: 'Snack',
    labelFR: 'Snack / Fast Food',
    labelAR: 'مأكولات خفيفة',
    labelEN: 'Snack Bar',
    icon: 'Pizza',
    defaultCategories: ['Sandwiches', 'Tacos', 'Frites & Accompagnements', 'Boissons', 'Formules Midi'],
    suggestedStock: [
      { name: 'Pains Tacos (Galettes)', unit: 'Paquet', minStock: 20, unitCost: 25 },
      { name: 'Viande hachée fraîche (Kefta)', unit: 'kg', minStock: 10, unitCost: 95 },
      { name: 'Frites surgelées pré-cuites', unit: 'kg', minStock: 50, unitCost: 18 },
      { name: 'Sauce Algérienne seau', unit: 'kg', minStock: 4, unitCost: 45 },
      { name: 'Fromage râpé Mozzarella/Red', unit: 'kg', minStock: 15, unitCost: 68 }
    ]
  },
  {
    id: 'Glacier',
    labelFR: 'Glacier',
    labelAR: 'محل مثلجات',
    labelEN: 'Ice Cream Parlor',
    icon: 'IceCream',
    defaultCategories: ['Boules de Glace', 'Coupes Spéciales', 'Milkshakes', 'Gaufres & Crêpes', 'Boissons Chaudes'],
    suggestedStock: [
      { name: 'Base crème glacée neutre', unit: 'Litre', minStock: 40, unitCost: 32 },
      { name: 'Purée de Fraises sauvages', unit: 'kg', minStock: 10, unitCost: 55 },
      { name: 'Pâte de Pistache pure', unit: 'kg', minStock: 3, unitCost: 290 },
      { name: 'Cornets de glace gaufrette', unit: 'Carton', minStock: 5, unitCost: 120 },
      { name: 'Nappage Chocolat chaud', unit: 'kg', minStock: 8, unitCost: 42 }
    ]
  },
  {
    id: 'Hotel',
    labelFR: 'Hôtel / Maison d\'Hôtes',
    labelAR: 'فندق / دار ضيافة',
    labelEN: 'Hotel / Guesthouse',
    icon: 'Hotel',
    defaultCategories: ['Nuitées / Chambres', 'Restaurant de l\'Hôtel', 'Spa & Massage', 'Excursions / Transferts', 'Événements / Séminaires'],
    suggestedStock: [
      { name: 'Kit Amenities (Savon, Shampoing)', unit: 'Ensembles', minStock: 100, unitCost: 4.5 },
      { name: 'Draps et serviettes blancs', unit: 'Unités', minStock: 50, unitCost: 110 },
      { name: 'Huiles essentielles de massage', unit: 'Flacons', minStock: 15, unitCost: 65 },
      { name: 'Produits de nettoyage blanchisserie', unit: 'Litre', minStock: 30, unitCost: 24 }
    ]
  },
  {
    id: 'SalonDeThe',
    labelFR: 'Salon de thé',
    labelAR: 'صالون شاي',
    labelEN: 'Tea Salon',
    icon: 'GlassWater',
    defaultCategories: ['Thés de Prestige', 'Infusions Bio', 'Douceurs & Pâtisseries', 'Petits Déjeuners', 'Espace Coworking'],
    suggestedStock: [
      { name: 'Thé Vert Menthe Impérial', unit: 'kg', minStock: 5, unitCost: 140 },
      { name: 'Thé Noir Earl Grey Premium', unit: 'kg', minStock: 4, unitCost: 165 },
      { name: 'Miel d\'Eucalyptus pur', unit: 'kg', minStock: 10, unitCost: 110 },
      { name: 'Cornes de gazelle artisanales', unit: 'Plateau', minStock: 6, unitCost: 180 }
    ]
  },
  {
    id: 'Epicerie',
    labelFR: 'Épicerie / Supérette',
    labelAR: 'بقالة / سوبرماركت',
    labelEN: 'Grocery / Mini-Market',
    icon: 'ShoppingCart',
    defaultCategories: ['Alimentation Générale', 'Produits Frais', 'Droguerie & Hygiène', 'Boissons & Snacks', 'Crèmerie'],
    suggestedStock: [
      { name: 'Huile de table 5L (Lesieur)', unit: 'Bouteilles', minStock: 24, unitCost: 78 },
      { name: 'Sucre morceaux carton 5kg', unit: 'Boîtes', minStock: 30, unitCost: 32 },
      { name: 'Farine blanche luxe sac 10kg', unit: 'Sacs', minStock: 15, unitCost: 55 },
      { name: 'Savon liquide vaisselle 1L', unit: 'Flacons', minStock: 20, unitCost: 14 },
      { name: 'Eau Minérale 1.5L (Sidi Ali)', unit: 'Packs (6 blles)', minStock: 40, unitCost: 18.5 }
    ]
  },
  {
    id: 'Boucherie',
    labelFR: 'Boucherie',
    labelAR: 'مجزرة',
    labelEN: 'Butcher Shop',
    icon: 'Beef',
    defaultCategories: ['Viande Bovine (Bœuf)', 'Viande Ovine (Agneau)', 'Volailles', 'Charcuterie & Kefta', 'Formules Grillades'],
    suggestedStock: [
      { name: 'Demi-carcasse de bœuf', unit: 'kg', minStock: 150, unitCost: 78 },
      { name: 'Agneau entier de la région', unit: 'kg', minStock: 60, unitCost: 88 },
      { name: 'Épices spéciales Kefta & Merguez', unit: 'kg', minStock: 10, unitCost: 45 },
      { name: 'Boyaux naturels pour merguez', unit: 'Mètres', minStock: 200, unitCost: 1.2 }
    ]
  },
  {
    id: 'Poissonnerie',
    labelFR: 'Poissonnerie',
    labelAR: 'مسامك / بائع سمك',
    labelEN: 'Fish Market',
    icon: 'Fish',
    defaultCategories: ['Poissons Blancs', 'Poissons Bleus (Sardines...)', 'Crustacés & Coquillages', 'Plateaux de Fruits de Mer', 'Nettoyage & Cuisson'],
    suggestedStock: [
      { name: 'Sardines fraîches (Port)', unit: 'kg', minStock: 30, unitCost: 12 },
      { name: 'Crevettes roses moyennes', unit: 'kg', minStock: 15, unitCost: 75 },
      { name: 'Calamars entiers frais', unit: 'kg', minStock: 12, unitCost: 80 },
      { name: 'Glace carbonique pilée', unit: 'kg', minStock: 100, unitCost: 2.5 }
    ]
  },
  {
    id: 'Primeur',
    labelFR: 'Primeur (Fruits & Légumes)',
    labelAR: 'خضروات وفواكه',
    labelEN: 'Fresh Produce Vendor',
    icon: 'Leaf',
    defaultCategories: ['Légumes de Saison', 'Fruits Locaux', 'Herbes & Épices', 'Produits Bio d\'Agadir', 'Paniers de la semaine'],
    suggestedStock: [
      { name: 'Tomates rondes de Souss', unit: 'kg', minStock: 100, unitCost: 4.5 },
      { name: 'Pommes de terre de Midelt', unit: 'kg', minStock: 150, unitCost: 5 },
      { name: 'Oranges à jus de Berkane', unit: 'kg', minStock: 120, unitCost: 5.5 },
      { name: 'Oignons rouges secs', unit: 'kg', minStock: 100, unitCost: 4 }
    ]
  },
  {
    id: 'Pharmacie',
    labelFR: 'Pharmacie',
    labelAR: 'صيدلية',
    labelEN: 'Pharmacy',
    icon: 'Pills',
    defaultCategories: ['Médicaments Prescrits', 'Médicaments Sans Ordonnance', 'Parapharmacie / Cosmétiques', 'Bébés & Nutrition', 'Orthopédie'],
    suggestedStock: [
      { name: 'Doliprane 1000mg Boîte', unit: 'Boîtes', minStock: 50, unitCost: 11.2 },
      { name: 'Lait bébé 1er âge de marque', unit: 'Boîtes', minStock: 20, unitCost: 72 },
      { name: 'Gel hydroalcoolique 500ml', unit: 'Flacons', minStock: 30, unitCost: 18 },
      { name: 'Pansements stériles boîte', unit: 'Boîtes', minStock: 40, unitCost: 12.5 }
    ]
  },
  {
    id: 'SalleDeSport',
    labelFR: 'Salle de sport',
    labelAR: 'نادي رياضي',
    labelEN: 'Gym / Fitness Club',
    icon: 'Dumbbell',
    defaultCategories: ['Abonnements Mensuels', 'Abonnements Annuels', 'Séances de Coaching Privé', 'Bar à Protéines & Boissons', 'Merchandising / T-shirts'],
    suggestedStock: [
      { name: 'Pot Protéines Whey 2kg', unit: 'Pots', minStock: 10, unitCost: 480 },
      { name: 'Boissons énergisantes canette', unit: 'Unités', minStock: 60, unitCost: 12 },
      { name: 'Serviettes de sport logotées', unit: 'Unités', minStock: 30, unitCost: 35 },
      { name: 'Bracelets RFID d\'accès', unit: 'Unités', minStock: 100, unitCost: 8 }
    ]
  },
  {
    id: 'SalonDeCoiffure',
    labelFR: 'Salon de coiffure',
    labelAR: 'صالون حلاقة',
    labelEN: 'Hair Salon',
    icon: 'Scissors',
    defaultCategories: ['Coupes Hommes / Barbe', 'Coupes Femmes / Brushing', 'Soins Capillaires / Couleur', 'Produits Capillaires en vente', 'Forfaits Mariage'],
    suggestedStock: [
      { name: 'Shampoing professionnel 5L', unit: 'Bidons', minStock: 3, unitCost: 160 },
      { name: 'Lames de rasoir jetables (Gillette)', unit: 'Paquet', minStock: 10, unitCost: 35 },
      { name: 'Cire coiffante premium', unit: 'Pots', minStock: 15, unitCost: 45 },
      { name: 'Laque cheveux professionnelle 500ml', unit: 'Flacons', minStock: 8, unitCost: 55 }
    ]
  },
  {
    id: 'InstitutDeBeaute',
    labelFR: 'Institut de beauté',
    labelAR: 'معهد تجميل',
    labelEN: 'Beauty Salon & Spa',
    icon: 'Sparkles',
    defaultCategories: ['Manucure / Pédicure', 'Soins du Visage', 'Massages & Hammam', 'Épilation', 'Vente Cosmétiques de Luxe'],
    suggestedStock: [
      { name: 'Huile d\'Argan pure certifiée', unit: 'Litre', minStock: 5, unitCost: 140 },
      { name: 'Vernis à ongles semi-permanent', unit: 'Flacons', minStock: 40, unitCost: 45 },
      { name: 'Argile verte de l\'Atlas (Ghassoul)', unit: 'kg', minStock: 10, unitCost: 18 },
      { name: 'Savon noir marocain beldi', unit: 'kg', minStock: 15, unitCost: 12 }
    ]
  },
  {
    id: 'Boutique',
    labelFR: 'Boutique (Prêt-à-porter / Retail)',
    labelAR: 'محل ملابس / تجارة تجزئة',
    labelEN: 'Boutique / Retail Store',
    icon: 'Shirt',
    defaultCategories: ['Vêtements Homme', 'Vêtements Femme', 'Accessoires & Chaussures', 'Soldes / Promotions', 'E-commerce / Expéditions'],
    suggestedStock: [
      { name: 'Sacs en papier kraft logotés', unit: 'Unités', minStock: 300, unitCost: 1.8 },
      { name: 'Étiquettes de prix thermiques', unit: 'Rouleaux', minStock: 10, unitCost: 22 },
      { name: 'Cintres en bois d\'acacia', unit: 'Unités', minStock: 100, unitCost: 6.5 }
    ]
  },
  {
    id: 'Pressing',
    labelFR: 'Pressing / Blanchisserie',
    labelAR: 'مصبغة / تنظيف جاف',
    labelEN: 'Dry Cleaning / Laundry',
    icon: 'Wind',
    defaultCategories: ['Nettoyage à Sec', 'Lavage & Repassage simple', 'Nettoyage Tapis / Canapés', 'Forfaits Mensuels Hôtels', 'Livraison de linge propre'],
    suggestedStock: [
      { name: 'Lessive liquide concentrée pro', unit: 'Bidon 20L', minStock: 4, unitCost: 320 },
      { name: 'Cintres métalliques fins', unit: 'Unités', minStock: 500, unitCost: 0.4 },
      { name: 'Housses en plastique de protection', unit: 'Rouleaux', minStock: 8, unitCost: 110 },
      { name: 'Détachant chimique spécial à sec', unit: 'Flacon 1L', minStock: 5, unitCost: 85 }
    ]
  },
  {
    id: 'LocationVoitures',
    labelFR: 'Location de voitures',
    labelAR: 'كراء السيارات',
    labelEN: 'Car Rental',
    icon: 'Car',
    defaultCategories: ['Voitures Économiques (Clio...)', 'Berlines Familiales', '4x4 & SUV', 'Location de Luxe', 'Services Chauffeur'],
    suggestedStock: [
      { name: 'Huile moteur 10W40 pro', unit: 'Litre', minStock: 20, unitCost: 48 },
      { name: 'Filtres à huile standard (Dacia)', unit: 'Unités', minStock: 12, unitCost: 35 },
      { name: 'Liquide lave-glace concentré', unit: 'Bidon 5L', minStock: 10, unitCost: 25 },
      { name: 'Liquide de refroidissement pro', unit: 'Bidon 5L', minStock: 8, unitCost: 38 }
    ]
  },
  {
    id: 'Garage',
    labelFR: 'Garage Automobile',
    labelAR: 'ورشة اصلاح السيارات',
    labelEN: 'Auto Repair / Garage',
    icon: 'Wrench',
    defaultCategories: ['Vidange & Entretien', 'Mécanique Générale', 'Diagnostic Électronique', 'Pneumatiques & Alignement', 'Tôlerie & Peinture'],
    suggestedStock: [
      { name: 'Plaquettes de frein universelles', unit: 'Paires', minStock: 15, unitCost: 140 },
      { name: 'Huile de vidange premium 5W30', unit: 'Litre', minStock: 40, unitCost: 65 },
      { name: 'Filtre à air standard Maroc', unit: 'Unités', minStock: 20, unitCost: 45 },
      { name: 'Nettoyant injecteurs professionnel', unit: 'Flacon 300ml', minStock: 24, unitCost: 32 }
    ]
  },
  {
    id: 'CommerceGros',
    labelFR: 'Commerce de gros',
    labelAR: 'تجارة الجملة',
    labelEN: 'Wholesale Commerce',
    icon: 'Package',
    defaultCategories: ['Vente par Palette', 'Vente par Carton entier', 'Commandes Distributeurs', 'Frais de Logistique / Port', 'Commandes Import'],
    suggestedStock: [
      { name: 'Palettes en bois standards', unit: 'Unités', minStock: 50, unitCost: 45 },
      { name: 'Film étirable transparent rouleau', unit: 'Rouleaux', minStock: 15, unitCost: 68 },
      { name: 'Scotch d\'emballage brun large', unit: 'Unités', minStock: 40, unitCost: 6.5 }
    ]
  },
  {
    id: 'Autre',
    labelFR: 'Autre Établissement',
    labelAR: 'نشاط تجاري آخر',
    labelEN: 'Other Business Type',
    icon: 'Store',
    defaultCategories: ['Services de Base', 'Vente de Marchandises', 'Conseil / Forfaits', 'Prestations Diverses'],
    suggestedStock: [
      { name: 'Fournitures de bureau de base', unit: 'Lot', minStock: 2, unitCost: 150 },
      { name: 'Consommables d\'impression papier', unit: 'Rame A4', minStock: 10, unitCost: 38 }
    ]
  }
];

export const getSectorById = (id: SectorType): SectorDefinition => {
  return SECTORS_LIST.find(s => s.id === id) || SECTORS_LIST[0];
};
