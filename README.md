# SENSOGRAPHY •° — V8

Instrument de composition sensible. React + Vite, moteur Canvas 2D animé sans textures précalculées ni WebGL.

## Démarrage

`npm install` puis `npm run dev`. Production : `npm run build`.

## Architecture

- `src/synth.js` : douze signatures animées, composition directe par activation des pictogrammes, deux motifs d'interaction, boucle nominale de 12 secondes.
- `src/engine.js` : libellés des forces.
- `src/main.jsx` : hublot, états des forces, capture PNG/vidéo et Sensothèque IndexedDB.
- `public/sw.js` : cache PWA versionné.

## Limites

Signatures procédurales, non simulations biologiques. La diversité esthétique et les performances doivent être testées sur appareil. Les interactions sont partielles ; la galerie conserve des images statiques. Le projet ne constitue pas un dispositif diagnostique ou thérapeutique.
