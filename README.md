# Morphoz •° — Le psychographe

Importe tes souvenirs. Révèle ton rêve.

React 19, Vite 6, Three.js, GLSL et Web Audio. Traitement local, sans serveur de données ni IA générative.

- Composition multicouche et bruit Simplex.
- Dramaturgie sonore, particules et bloom.
- Abstraction réglable et variations.
- Export vidéo 1080p en temps réel selon navigateur.
- WebXR : écran cylindrique frontal fixe, 180°, monoscopique, dans le navigateur Quest. HTTPS requis. Pas d'export VR180 stéréoscopique.
- PWA : cache de l'application après premier chargement en ligne ; les médias personnels restent en mémoire pendant la session.

## Développement

```sh
npm install
npm run dev
npm run build
npm run preview
```

## Recette manuelle

1. Importer des photos portrait et paysage ; révéler, changer l'abstraction et la variation.
2. Importer un audio ; vérifier lecture, pause et reprise.
3. Exporter une courte vidéo, vérifier son et image.
4. Sur Quest, entrer et sortir de la VR, vérifier orientation, fluidité et reprise de la prévisualisation.
5. Après installation du service worker, recharger hors ligne.
6. Vérifier l'absence de coutures et de clignotements sur plusieurs ensembles d'images.

Médiation créative expérimentale, sans efficacité thérapeutique démontrée. Interrompre l'expérience en cas d'inconfort.
