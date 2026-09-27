# CHIVA Vision — démonstration iPhone

Ouvrir la version actuelle : **https://nord1g691.github.io/C.H.I.V.A/?v=09**

## Version 0.9 : Vision

- Affichage **caméra arrière réelle** (avec autorisation explicite Safari, sur une adresse HTTPS).
- Mode salon fictif si l'accès à la caméra est refusé.
- Repères **2D déplaçables** sur télévision, climatiseur, lumières et volets ; ajout de piscine et portail.
- Actions de démonstration : télécommande TV (gauche/droite/haut/bas/OK, volume, chaîne), consigne de clim, luminosité et couleurs, position des volets, température piscine.
- Confirmation avant toute **simulation** de l'ouverture du portail.
- Écran de montre **simulé sur iPhone**, avec gestes tactiles et directionnels ; scénarios cinéma, solaire et nuit.
- Les repères personnalisés sont mémorisés localement dans Safari, lorsque son stockage est autorisé.

**Important :** c'est une démo **sans connexion domotique réelle**. Les repères 2D restent à leur position sur l'écran et **ne suivent pas encore les objets dans l'espace**. Pas de reconnaissance automatique, pas de véritable application Apple Watch ni de commande réelle. L'ARKit, les connexions HomeKit/Home Assistant/Tuya et les capteurs de la montre nécessitent une future version native testée sur appareil.

La caméra reste locale ; aucune image ni aucun identifiant n'est envoyé à CHIVA. Ne jamais saisir ses identifiants Home Assistant sur un prototype public.

Ancienne démo : [demo-classique.html](demo-classique.html).

## Hébergement GitHub Pages

Dans [Settings → Pages](https://github.com/Nord1g691/C.H.I.V.A/settings/pages), publier `main` depuis `/(root)`. Le dépôt CHIVA est indépendant du dépôt Jarvis V3.
