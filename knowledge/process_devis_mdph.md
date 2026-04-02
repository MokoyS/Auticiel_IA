Documentation des workflows exacts gérés par Maxime. Base de référence pour l'automatisation Make + Claude.

## 1. Traitement d'un devis MDPH
Déclencheur : Email Zendesk "Vous avez été assigné à Demande de devis MDPH"
Source : Formulaire en ligne auticiel.com/devis-mdph/ → crée automatiquement une piste dans Odoo
Infos pré-remplies dans la piste Odoo (onglet Notes) :
- Nom demandeur + bénéficiaire
- Email + téléphone
- Adresse facturation
- Tuteur légal (oui/non)
- Pack AMIKEO souhaité (Mobilité ou Confort)
- Durée abonnement souhaitée (1, 2 ou 3 ans)
- Webinar complémentaire souhaité (oui/non, +60€ TTC)
- Séance formation individuelle 3h souhaitée (oui/non, +660€ TTC)
- Financement PCH/MDPH (oui/non)
- MDPH de rattachement + département
- Date de dépôt dossier MDPH envisagée
- Établissement de rattachement (si applicable)
Règle importante : Ne jamais rédiger un devis manuellement suite à une demande par mail. Toujours rediriger vers le formulaire : https://auticiel.com/devis-mdph/
Étapes exactes :
1. Ouvrir le ticket Zendesk
1. Cliquer "Voir la piste" → s'ouvre dans Odoo
1. Lire les infos dans l'onglet Notes de la piste
1. Cliquer "Nouveau devis"
1. Sélectionner le modèle selon le pack demandé :
1. Adapter le devis selon la demande du client (devis sur mesure) :
1. Vérifier liste de prix = B2C (EUR)
1. Envoyer le devis par email depuis Odoo avec le template "Vente : Devis MDPH"
1. Retour sur Zendesk → marquer le ticket comme Résolu (sans réponse)
Temps actuel : 5-10 min par devis
Objectif automation : Make détecte le ticket Zendesk → lit les Notes de la piste Odoo → configure automatiquement le devis → Maxime valide et envoie en 1 clic → Zendesk fermé automatiquement

## 2. Validation d'un paiement reçu
Déclencheur : Message de Cheikh (RH) dans le canal Slack "virement recu en banque"
Étapes exactes :
1. Lire le message Slack de Cheikh dans le canal "virement recu en banque"
1. Identifier le client correspondant dans Odoo
1. Ouvrir le devis du client dans Odoo
1. Passer le statut du devis de "Devis envoyé" à "Confirmé"
1. La commande apparaît alors dans l'onglet Inventaire → Bons de livraison
Modes de paiement acceptés : Virement ou chèque uniquement (pas de CB)
Règle : La commande n'est traitée qu'après réception effective du règlement

## 3. Traitement d'une commande (post-paiement)
Déclencheur : Commande confirmée visible dans Odoo → Inventaire → Bons de livraison
Étapes exactes :
1. Repérer la commande dans Odoo → Inventaire → Bons de livraison (statut "Prêt")
1. Générer l'étiquette de livraison :
1. Envoyer l'étiquette par email à David (responsable ESAT à côté des bureaux Auticiel)
1. Envoyer les instructions à David par email :
1. David prépare et configure physiquement la tablette
1. David imprime l'étiquette et expédie la tablette
1. Délai annoncé aux clients : 5 à 10 jours ouvrés après réception du paiement
Commandes B2B spécifiques : Email à David avec "Commande B2B [numéro] - [nom établissement]" + adresse de livraison + spécificités

## 4. Génération étiquette de livraison
- B2C (particuliers) → site Colissimo
- B2B (établissements) → site Chronopost
- L'étiquette est envoyée par email à David qui l'imprime et l'appose sur le colis
- Jamais imprimée par Maxime directement

## 5. SAV — Tablette défectueuse / sous garantie
Garanties :
- Tablette : 24 mois pièces et main d'œuvre en atelier
- Batterie : 12 mois
- Exclusions : casse, vol, perte, mauvaise manipulation
Process retour garantie :
1. Vérifier que le défaut est bien constructeur (pas une casse)
1. Envoyer le mail de retour garantie (template complet disponible — voir ci-dessous)
1. Le client envoie la tablette à : AUTICIEL, Bâtiment WeWork, 198 Av de France, 75012 Paris
1. Auticiel envoie la tablette à Samsung pour réparation
1. Si Samsung refuse la garantie → devis de réparation envoyé au client
1. Si client refuse le devis → frais de gestion ~30€
1. Délai réparation Samsung : minimum 1 mois
Adresse retour : AUTICIEL, Bâtiment WeWork, 198 Av de France, 75012 PARIS
Contact : +33 (0)9 72 39 44 44 | customer-service@auticiel.com
Perte/vol : Le client rachète une tablette. Auticiel lie ensuite l'ancien compte à la nouvelle tablette.

## 6. SAV — Problèmes techniques (cloud, app, mode aidant)
Procédure de premier niveau (dans cet ordre) :
1. Vérifier connexion Internet active
1. Effectuer les mises à jour Android
1. Effectuer les mises à jour AMIKEO via le Gestionnaire
1. Forcer la synchronisation application par application
1. Éteindre et rallumer la tablette
1. Réessayer sous Wi-Fi stable
Si insuffisant :
- Prise en main à distance via TeamViewer QuickSupport
- RDV obligatoirement via lien Google Calendar
- Si problème dû à mauvaise manipulation : intervention facturée
Si trop technique : Escalader à François (dev technique interne)

## 7. Routing des emails entrants
Zendesk uniquement (contact@ et support@ arrivent au même endroit — pas de différence de traitement)

Horaires service client : 9h-17h
Réponse actuelle : Via Zendesk, avec aide de Gemini pour rédiger — mais Maxime relit toujours

## 8. Procédure MDPH — Financement
Cas standard (80% des cas) :
