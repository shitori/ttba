# 🚀 Guide de Déploiement Backend sur Railway

Ce guide vous aidera à déployer votre backend TTBA sur Railway.

---

## 📋 Prérequis

- Un compte GitHub avec votre repo `ttba`
- Un compte Railway (inscription gratuite sur https://railway.app)

---

## ✅ Étape 1 : Préparer votre repository

Le fichier `Procfile` a déjà été créé dans le dossier `/backend`. 

Maintenant, vous devez committer et pusher les changements :

```bash
# Depuis la racine du projet
git add backend/Procfile
git commit -m "Add Procfile for Railway deployment"
git push origin main
```

---

## ✅ Étape 2 : Créer un compte Railway

1. Allez sur https://railway.app
2. Cliquez sur **Sign Up**
3. Connectez-vous avec GitHub (recommandé pour plus de facilité)
4. Autorisez Railway à accéder à vos repositories

---

## ✅ Étape 3 : Créer un projet Railway

### Option A : Via GitHub (Recommandé)

1. Dans le dashboard Railway, cliquez sur **+ New Project**
2. Sélectionnez **GitHub Repo**
3. Connectez votre compte GitHub si ce n'est pas fait
4. Cherchez et sélectionnez votre repo `ttba`
5. Sélectionnez la branche `main` (ou votre branche par défaut)
6. Railway va **auto-détecter** que c'est un projet Node.js

### Option B : Via CLI

Si vous préférez utiliser la ligne de commande :

```bash
# Installer Railway CLI
npm install -g @railway/cli

# Depuis la racine du projet
railway login
railway init
railway up
```

---

## ✅ Étape 4 : Configurer les variables d'environnement

Après la création du projet Railway :

1. Ouvrez votre projet dans le dashboard Railway
2. Allez dans l'onglet **Variables**
3. Ajoutez les variables d'environnement suivantes :

| Variable | Valeur | Notes |
|----------|--------|-------|
| `PORT` | `3000` | Railway va assigner un port automatiquement, mais cette variable sera utilisée |
| `FRONTEND_URL` | `https://votre-frontend-url.github.io` | **Remplacez par l'URL de votre frontend GitHub Pages** |
| `NODE_ENV` | `production` | Pour l'environnement de production |

**IMPORTANT :** Trouvez l'URL de votre frontend GitHub Pages :
- Elle est généralement de la forme : `https://votre-username.github.io/ttba/` ou `https://votre-domaine-personnalisé/`
- Allez sur votre repo frontend sur GitHub → Settings → Pages pour la confirmer

---

## ✅ Étape 5 : Déployer

### Si vous avez choisi l'Option A (GitHub) :
1. Railway va **automatiquement** déployer votre code
2. Attendez quelques minutes
3. Vous verrez un lien de deployment dans le dashboard

### Si vous avez choisi l'Option B (CLI) :
```bash
railway up
```

---

## ✅ Étape 6 : Vérifier le déploiement

Une fois le déploiement terminé :

1. **Trouvez l'URL publique** de votre backend dans le dashboard Railway (elle ressemblera à `https://ttba-backend-production.up.railway.app`)

2. **Testez l'endpoint santé** :
   ```bash
   curl https://ttba-backend-production.up.railway.app/health
   ```
   Vous devez recevoir une réponse JSON : `{"status":"OK","timestamp":"..."}`

3. **Vérifiez les logs** dans Railroad pour voir s'il y a des erreurs

---

## 🔗 Étape 7 : Mettre à jour votre frontend

Une fois votre backend déployé, vous devez mettre à jour votre frontend pour utiliser l'URL du backend :

### Dans `frontend/src/composables/useSocket.ts` (ou similaire)

Trouvez où vous créez la connexion Socket.IO et remplacez :

```typescript
// ❌ Avant
const socket = io('http://localhost:3001')

// ✅ Après
const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001')
```

### Dans `frontend/.env.production`

Créez ou modifiez le fichier `.env.production` :

```env
VITE_BACKEND_URL=https://votre-backend-railway-url.up.railway.app
```

---

## 📊 Commandes utiles Railway CLI

```bash
# Voir le statut du déploiement
railway status

# Voir les logs en direct
railway logs

# Voir les variables d'environnement
railway variables

# Ouvrir le dashboard
railway open
```

---

## 🐛 Dépannage

### Le déploiement échoue ?
1. Vérifiez les logs dans le dashboard Railway
2. Assurez-vous que `Procfile` est dans `/backend`
3. Vérifiez que `package.json` a les bonnes dépendances

### Socket.IO ne se connecte pas ?
1. Vérifiez que `FRONTEND_URL` est correctement définie dans Railway
2. Assurez-vous que votre frontend utilise l'URL correcte du backend

### CORS errors ?
1. Vérifiez que `FRONTEND_URL` correspond exactement à l'URL de votre frontend
2. La variable doit inclure le protocole (`https://`)

---

## 📞 Besoin d'aide ?

- Documentation Railway : https://docs.railway.app
- Documentation Socket.IO CORS : https://socket.io/docs/v4/handling-cors/
- Support Railway : https://railway.app/support

Bon déploiement ! 🎉

