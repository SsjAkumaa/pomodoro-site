Améliore mon site Pomodoro existant sans casser les fonctionnalités actuelles.

PROBLÈME À CORRIGER
Le timer actuel ralentit ou se met en pause quand l'utilisateur change d’onglet ou ouvre une autre fenêtre.
Je veux que le timer reste précis même si l'utilisateur change de page ou minimise la fenêtre.

Solution technique :
Ne pas dépendre uniquement de setInterval.
Utiliser un système basé sur un timestamp réel :

* sauvegarder startTime avec Date.now()
* recalculer le temps restant avec Date.now() à chaque rafraîchissement
* ainsi le temps écoulé reste correct même si l’onglet est en arrière-plan

Le timer doit :

* continuer de s’écouler en arrière-plan
* sonner correctement à la fin
* rester précis même après un changement d’onglet.

---

STATISTIQUES LOCALES

Ajouter un bouton **Statistiques** qui ouvre un panneau ou une section.

Toutes les données doivent être sauvegardées **localement dans le navigateur uniquement** (localStorage ou IndexedDB).
Aucune base de données externe.

Afficher :

• temps total aujourd’hui
• temps total de la semaine
• temps total du mois

---

CALENDRIER DE PRODUCTIVITÉ

Créer une vue calendrier montrant le temps travaillé chaque jour.

Fonctionnement :

• chaque case du calendrier représente un jour
• afficher le nombre d’heures/minutes réalisées ce jour-là
• utiliser un code couleur (plus lumineux = plus productif)

Ajouter :

• résumé hebdomadaire
• résumé mensuel

Structure de stockage locale possible :

{
"2026-03-05": 7200,
"2026-03-06": 5400
}

(valeurs en secondes)

---

GAMIFICATION SIMPLE

Ajouter un système de niveau basé sur le temps total travaillé.

Exemple :

Level 1 = 1h
Level 2 = 5h
Level 3 = 10h
Level 4 = 25h
Level 5 = 50h

Afficher :

• niveau actuel
• barre de progression vers le prochain niveau

Tout doit rester **local**.

---

INTÉGRATION MUSIQUE

Ajouter le **widget officiel Deezer embed player** pour écouter de la musique directement dans la page.

Le lecteur doit être intégré proprement dans l’interface.

---

STYLE VISUEL

Le design du site doit garder un **style cyberpunk / néon**.

Ajouter :

• glow néon sur les widgets
• bordures lumineuses
• effets de lumière subtils
• animations légères au hover
• cohérence avec le thème cyberpunk existant

Les widgets statistiques et calendrier doivent aussi avoir ce style néon.

---

CONTRAINTES IMPORTANTES

• ne pas casser le Pomodoro existant
• aucune base de données externe
• aucune connexion serveur
• tout doit fonctionner localement
• code simple et robuste
