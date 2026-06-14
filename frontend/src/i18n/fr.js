const fr = {
  // Nav
  home: 'Accueil', catalog: 'Catalogue', login: 'Connexion', register: 'Inscription', logout: 'Déconnexion',
  dashboard: 'Tableau de bord', profile: 'Profil', notifications: 'Notifications',
  // Home
  welcome: 'Bienvenue sur SELAALI', tagline: 'Le commerce simplifié',
  subtitle: 'Connecter grossistes, détaillants et livreurs à travers toute l\'Algérie',
  getStarted: 'Commencer maintenant', browseProducts: 'Parcourir les produits',
  forWholesalers: 'Pour les grossistes', forRetailers: 'Pour les détaillants', forDelivery: 'Pour les livreurs',
  wholesalerDesc: 'Publiez vos produits, gérez votre stock, confirmez les commandes et développez votre activité en ligne.',
  retailerDesc: 'Trouvez les meilleurs prix, comparez les fournisseurs et commandez sans vous déplacer au marché.',
  deliveryDesc: 'Acceptez des livraisons, mettez à jour le statut en temps réel et augmentez vos revenus.',
  howItWorks: 'Comment ça marche', step1: 'Inscrivez-vous et faites-vous vérifier', step2: 'Publiez ou parcourez les produits', step3: 'Commandez et suivez la livraison',
  step1Desc: 'Créez votre compte, choisissez votre rôle et obtenez l\'approbation de notre équipe.',
  step2Desc: 'Les grossistes publient leurs produits. Les détaillants cherchent, comparent et choisissent.',
  step3Desc: 'Passez vos commandes, suivez-les en temps réel, livrées directement chez vous.',
  stats: 'Statistiques de la plateforme', statSuppliers: 'Fournisseurs actifs', statProducts: 'Produits listés', statOrders: 'Commandes passées', statWilayas: 'Wilayas couvertes',
  featuredCats: 'Parcourir par catégorie',
  // Auth
  email: 'Adresse e-mail', password: 'Mot de passe', confirmPassword: 'Confirmer le mot de passe',
  name: 'Nom complet', phone: 'Numéro de téléphone', wilaya: 'Wilaya', address: 'Adresse',
  businessName: 'Nom de l\'entreprise', selectRole: 'Choisissez votre rôle',
  roleWholesaler: 'Grossiste', roleRetailer: 'Détaillant', roleDriver: 'Livreur',
  alreadyHaveAccount: 'Vous avez déjà un compte ?', dontHaveAccount: 'Vous n\'avez pas de compte ?',
  loginHere: 'Connectez-vous ici', registerHere: 'Inscrivez-vous ici',
  loginSuccess: 'Bon retour !', registerSuccess: 'Compte créé ! En attente d\'approbation.',
  // Products
  products: 'Produits', search: 'Rechercher des produits...', filter: 'Filtres', sortBy: 'Trier par',
  category: 'Catégorie', allCategories: 'Toutes les catégories', priceRange: 'Fourchette de prix',
  minOrder: 'Commande min.', unit: 'Unité', stock: 'En stock', inStock: 'En stock', outOfStock: 'Rupture de stock',
  addToCart: 'Ajouter au panier', buyNow: 'Commander', viewDetails: 'Voir les détails',
  supplier: 'Fournisseur', minOrderQty: 'Commande minimale', pricePerUnit: 'Prix / unité',
  noProducts: 'Aucun produit trouvé', relatedProducts: 'Produits similaires',
  // Orders
  orders: 'Commandes', orderHistory: 'Historique des commandes', placeOrder: 'Passer la commande',
  orderTotal: 'Total de la commande', orderStatus: 'Statut', orderDate: 'Date',
  pending: 'En attente', confirmed: 'Confirmée', processing: 'En préparation',
  shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée',
  cancelOrder: 'Annuler la commande', trackOrder: 'Suivre la commande', orderDetails: 'Détails de la commande',
  quantity: 'Quantité', subtotal: 'Sous-total', total: 'Total', notes: 'Remarques',
  deliveryAddress: 'Adresse de livraison',
  // Dashboard
  overview: 'Vue d\'ensemble', myProducts: 'Mes produits', myOrders: 'Mes commandes',
  favorites: 'Favoris', reports: 'Rapports', settings: 'Paramètres',
  addProduct: 'Ajouter un produit', editProduct: 'Modifier le produit', deleteProduct: 'Supprimer le produit',
  stockAlert: 'Alerte stock faible', totalRevenue: 'Revenu total', totalOrders: 'Total des commandes',
  pendingOrders: 'Commandes en attente', activeProducts: 'Produits actifs',
  // Admin
  users: 'Utilisateurs', moderation: 'Modération', categories: 'Catégories', platformStats: 'Statistiques de la plateforme',
  approve: 'Approuver', suspend: 'Suspendre', delete: 'Supprimer', activate: 'Activer',
  pendingApproval: 'En attente d\'approbation', active: 'Actif', suspended: 'Suspendu',
  // Delivery
  availableDeliveries: 'Livraisons disponibles', myDeliveries: 'Mes livraisons',
  acceptDelivery: 'Accepter', pickUp: 'Récupérée', inTransit: 'En transit', markDelivered: 'Marquer comme livrée',
  driver: 'Livreur', pickupAddress: 'Adresse de retrait', estimatedTime: 'Temps estimé',
  // Common
  loading: 'Chargement...', error: 'Une erreur est survenue', save: 'Enregistrer', cancel: 'Annuler',
  confirm: 'Confirmer', back: 'Retour', next: 'Suivant', submit: 'Envoyer', edit: 'Modifier',
  viewAll: 'Voir tout', noData: 'Aucune donnée disponible', required: 'Ce champ est obligatoire',
  price: 'Prix', actions: 'Actions', status: 'Statut', date: 'Date', name: 'Nom',
  pendingApprovalMsg: 'Votre compte est en attente d\'approbation. Vous serez notifié bientôt.',
  cartEmpty: 'Votre panier est vide', checkout: 'Commander', cart: 'Panier',
  supplierProfile: 'Profil du fournisseur', contactSupplier: 'Contacter le fournisseur',
  searchResults: 'Résultats de recherche', showing: 'Affichage de', of: 'sur', results: 'résultats',
  // Chatbot
  chatbotTitle: 'Assistant SELAALI', chatbotSubtitle: 'En ligne · Posez votre question',
  chatbotWelcome: 'Bonjour ! Je suis l\'assistant SELAALI. Comment puis-je vous aider ?',
  chatbotPlaceholder: 'Écrivez un message...', chatbotError: 'Désolé, une erreur est survenue. Veuillez réessayer.',
  // Suggestions
  suggestionsTitle: 'Partagez une suggestion', suggestionsSubtitle: 'Aidez-nous à améliorer SELAALI',
  suggestionName: 'Votre nom (facultatif)', suggestionEmail: 'Votre e-mail (facultatif)',
  suggestionMessage: 'Votre suggestion ou idée...', suggestionSend: 'Envoyer',
  suggestionSuccess: 'Merci ! Votre suggestion a bien été reçue.',
  suggestions: 'Suggestions',
};

export default fr;
