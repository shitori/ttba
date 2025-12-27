# 🚀 Checklist Rapide - Déploiement Railroad

## ✅ Checklist avant de déployer

- [ ] Vous avez un compte GitHub avec votre repo `ttba`
- [ ] Procfile créé dans `/backend`
- [ ] Votre code est commité et pushé sur GitHub

## 📋 Les 5 étapes principales

### 1. Inscription Railway
- Allez sur https://railway.app
- Inscrivez-vous avec GitHub

### 2. Créer le projet
- Dashboard Railway → New Project → GitHub Repo
- Sélectionnez le repo `ttba`

### 3. Configurer les variables
Allez dans **Variables** et ajoutez :
```
PORT=3000
FRONTEND_URL=https://votre-frontend-url.github.io/ttba
NODE_ENV=production
```

### 4. Déployer
Railway va déployer automatiquement (sinon cliquez sur Deploy)

### 5. Récupérer l'URL
- Allez dans **Deployments**
- Copiez l'URL publique du backend
- C'est votre `VITE_BACKEND_URL`

## 🔗 Mettre à jour le frontend

### 1. Modifier `frontend/.env.production`
```env
VITE_BACKEND_URL=https://votre-railway-backend-url.up.railway.app
```

### 2. Committer et rebâtir
```bash
git add frontend/.env.production
git commit -m "Update backend URL for production"
git push
```

## ✨ C'est tout !

Votre frontend GitHub Pages va se reconnecter au backend Railway automatiquement.

## 🧪 Test
```bash
curl https://votre-railway-backend-url.up.railway.app/health
```

Vous devez recevoir : `{"status":"OK",...}`

---

**Besoin d'aide ?** Consultez `RAILWAY_DEPLOYMENT_GUIDE.md` pour plus de détails.

