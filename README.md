# CHIVA — Control Home Intelligent Vision Assistant

Prototype **indépendant de Jarvis**, pensé pour l'iPhone, puis l'Apple Watch et, plus tard, les lunettes connectées.

## Démonstration Safari

Ouvrir [CHIVA](https://nord1g691.github.io/C.H.I.V.A/) après activation de GitHub Pages.

La version présente dans `index.html` est une démonstration interactive **entièrement simulée** : télécommande TV avec flèches et OK, éclairages, climatisation, volets et confirmation d'ouverture du portail. Aucune commande n'est envoyée à un équipement réel. Aucun jeton, adresse Home Assistant ou identifiant personnel n'est inclus.

## Activer GitHub Pages

1. Ouvrir [Settings → Pages](https://github.com/Nord1g691/C.H.I.V.A/settings/pages).
2. Sous **Build and deployment**, choisir **Deploy from a branch**.
3. Sélectionner `main`, dossier `/(root)`, puis cliquer sur **Save**.
4. Attendre la publication par GitHub puis ouvrir **https://nord1g691.github.io/C.H.I.V.A/** dans Safari. L'URL ne fonctionne qu'après publication.

> Ne pas saisir d'identifiants Home Assistant ou Tuya dans cette démonstration publique. Le futur contrôle réel sera intégré à une application dotée d'un stockage sécurisé des identifiants.

## Projet à venir

- iOS : caméra, repères AR et associations d'appareils.
- watchOS : télécommande TV et calibrage expérimental du poignet.
- Écosystèmes : Apple Home (HomeKit), Home Assistant et Tuya/Smart Life selon disponibilité des API.
- Sécurité : confirmations explicites pour portail, garage et autres accès sensibles.

Ce dépôt hébergera uniquement CHIVA. Le projet Jarvis V3 reste distinct.
