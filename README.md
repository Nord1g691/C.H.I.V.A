# CHIVA Vision 1.0 — démo iPhone

**Ouvrir CHIVA dans Safari :** https://nord1g691.github.io/C.H.I.V.A/?v=10

### Tester le nouveau suivi visuel

1. Sur l'iPhone, ouvrir la page directement dans Safari, puis **Essayer avec ma caméra** et autoriser la caméra arrière.
2. Pointer la télévision ou la clim. **Maintenir et déplacer** son repère jusqu'à l'objet (ou ajouter un nouvel appareil), puis le toucher.
3. Appuyer sur **◎ Fixer sur cet objet**. Un symbole 🔒 indique que le suivi a réussi.
4. Déplacer **doucement** l'iPhone de quelques dizaines de centimètres : le repère doit suivre l'objet dans l'image.
5. Si le repère indique **⚠ PERDU**, revenir vers l'objet et appuyer à nouveau sur **Fixer**.

Le suivi est **local et expérimental** : il utilise de petits détails visuels de l'image de la caméra. Un mur uniforme, un écran noir, des mouvements rapides, des changements d'angle ou une faible lumière peuvent interrompre le suivi. Les images et les motifs recherchés ne sont pas sauvegardés ni envoyés à CHIVA. La caméra n'est activée qu'avec l'autorisation de l'utilisateur. Les boutons ne commandent encore aucun appareil réel.

Les **positions 2D** personnalisées peuvent être conservées dans Safari, mais ne constituent pas une carte 3D. Quand la caméra est fermée ou qu'on revient plus tard, le verrouillage visuel doit être refait. Pour des repères réellement fixes dans l'espace **et retrouvables entre les sessions**, il faut la future application iOS native avec **ARKit + ARAnchor + ARWorldMap** et une relocalisation réussie sur place.

Ancienne démo : [demo-classique.html](demo-classique.html). Dépôt CHIVA indépendant de Jarvis V3.

### GitHub Pages

[Settings → Pages](https://github.com/Nord1g691/C.H.I.V.A/settings/pages) → Deploy from a branch → main → /(root). Un déploiement peut prendre quelques minutes. Version 1.0 : index.html + tracking.js, sans dépendance externe.
