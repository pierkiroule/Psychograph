# SENSOGRAPHY •°

Instrument artistique de composition sensible, sans IA ni serveur. React, Vite, Three.js.

## Démarrage

```sh
npm install
npm run dev
npm run build
npm run preview
```

## Architecture actuelle (V6)

- `src/main.jsx` : interface, capture PNG/vidéo, Sensothèque IndexedDB.
- `src/engine.js` : libellés des douze sensorigrammes.
- `src/synth.js` : 16 générateurs de textures, 20 palettes, six compositions et 12 animations périodiques. Rendu WebGL sur fond blanc, sans anaglyphe.
- `src/style.css` : interface responsive.
- `public/sw.js` : cache hors ligne.

## Limites connues

La diversité perceptive est insuffisante : les générateurs partagent un rendu sur plans texturés. Les animations ne constituent pas des simulations continues. Les exports vidéo dépendent du navigateur ; la galerie conserve des images, pas des recettes éditables.

## Prochaine architecture (non implémentée)

Développer et tester séparément six univers : aquarelle, sculpture, nuées, empreintes, ballet et mirages. Chaque univers doit avoir son propre modèle de simulation et de rendu, une interface de cycle de vie commune et des tests visuels. Conserver le hublot et la Sensothèque. Ne pas réintroduire le mode anaglyphe.

## Déploiement

Vercel, sortie `dist`. Tester sur mobile et desktop. Projet artistique, sans prétention diagnostique ou thérapeutique.
