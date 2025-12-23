# 📁 TTBA Upload & Party Game (Frontend)

Ce dépôt contient le frontend Vue 3 + TypeScript de l'application TTBA — à la fois un outil d'upload/filtrage de JSON volumineux et un petit jeu de soirée (TTBA Game) qui utilise des vidéos TikTok intégrées.

---

## ⚙️ État actuel
- Frontend : Vue 3 (Composition API) + TypeScript
- UI : Bulma + styles custom
- Build : Vite
- Nouvelle fonctionnalité : mode *Partie* (jeu de soirée) avec embed TikTok responsive + fallback si l'iframe est bloquée
- `.gitignore` mis à jour à la racine du repo pour ignorer node_modules, builds et fichiers IDE

---

## 🚀 Installation (développement)
1. Ouvrir un terminal
2. Aller dans le dossier frontend :

```powershell
cd frontend
npm install
```

3. Lancer le serveur de développement :

```powershell
npm run dev
```

L'app est servie par Vite (par défaut `http://localhost:5173`).

---

## 🧭 Fonctionnalités principales
- Upload et traitement de fichiers JSON volumineux (progress bar, traitement non bloquant)
- Sélection des champs à conserver avant la soumission
- Prévisualisation des premiers éléments
- Envoi des données filtrées vers le backend (endpoint attendu : `http://localhost:5000/api/upload`)
- Mode Jeu (TTBA Game) : sélection aléatoire de vidéos extraites, quiz « Qui a aimé / Qui a envoyé ? »
  - Embed TikTok responsive (lazy-load)
  - Fallback si l'iframe est bloquée : affiche un bouton « Ouvrir sur TikTok »
- Micro-interactions et animations (boutons, transitions, effets gagnant/perdant)

---

## 🎮 Mode Jeu (nouveau)
- À partir de la page principale, après avoir chargé des données (players), cliquez sur "🚀 Lancer la partie".
- L'application choisit aléatoirement une vidéo (aimée ou partagée) et affiche l'embed TikTok.
- Si l'iframe est empêchée par une extension / CSP, l'interface affichera un fallback et permettra d'ouvrir la vidéo sur TikTok.
- Les boutons des joueurs ont des micro-transitions et indiquent immédiatement le résultat (vert = correct, rouge = incorrect).

Notes techniques :
- L'iframe est lazy-loaded (assignation du `src` depuis `data-src` au moment opportun) pour améliorer les performances.
- Si votre site sert une Content-Security-Policy stricte, autorisez `https://www.tiktok.com` dans `frame-src` / `child-src` si vous voulez permettre l'embed direct.

---

## 🔬 Tests rapides / smoke tests
- Vérifier que l'app démarre sans erreurs : `npm run dev` et ouvrir la console du navigateur.
- Charger un JSON d'exemple (voir `example-data.json`) pour peupler la liste des joueurs.
- Lancer une partie, vérifier :
  - L'iframe charge la vidéo et s'anime.
  - Si bloquée, le fallback apparaît et le bouton ouvre la vidéo dans un nouvel onglet.
  - Les boutons joueurs s'animent et mettent à jour le score.
- Tester responsive sur mobile / narrow viewport : l'embed garde un ratio correct.

---

## 🛠️ Scripts utiles
- Développement : `npm run dev`
- Build production : `npm run build`
- Type check : `npm run type-check` (si configuré)
- Lint (si configuré) : `npm run lint`

---

## 🔁 Backend attendu
- URL : `http://localhost:5000`
- Endpoint : `POST /api/upload`
- Content-Type : `application/json`
- Payload : Array<Object> (les objets filtrés côté client)

Exemple de réponse attendue :
```json
{ "success": true, "itemsProcessed": 12345 }
```

---

## 📌 Notes & problèmes connus
- Si vous voyez un placeholder/fallback à la place de la vidéo, c'est probablement dû à :
  - une extension navigateur bloquant les iframes (uBlock, Ghostery, etc.),
  - ou une CSP côté serveur qui n'autorise pas l'embed TikTok.
- Le fallback propose d'ouvrir la vidéo directement sur TikTok (nouvelle fenêtre).

---

## ✅ Changelog rapide (modifications récentes)
- Ajout du mode Jeu (TTBA Game) avec embed TikTok responsive + fallback
- Ajout d'animations / micro-interactions sur les boutons et titres
- Correction de bindings Vue (`ref` usage, lazy-load iframe)
- Mise à jour du `.gitignore` à la racine

---

## 📚 Documentation additionnelle
Pour plus de détails fonctionnels (gestion des gros fichiers, génération de fichiers de test, guides rapides), consultez les documents du dossier `frontend` :
- `QUICK_START.md` — démarrage rapide
- `USAGE_GUIDE.md` — guide utilisateur
- `TEST_FILES.md` — génération de jeux de données volumineux
- `CHANGELOG.md` — historique

---

## ✅ Prochaine étape (si vous voulez que je continue)
- Scanner automatiquement les composants `frontend/src/**/*.vue` pour lister les endroits où la nouvelle direction artistique (DA) n'a pas été appliquée, proposer patches.
- Extraire les styles communs vers `frontend/src/style.css` pour réutilisation globale.
- Ajouter un petit test unitaire pour la logique de sélection de la vidéo (runNewGame / selectPlayer).

Souhaitez‑vous que je lance le scan automatique maintenant et prépare les patches (proposition recommandée) ?

---

**Version frontend**: mise à jour 2025-12-23
