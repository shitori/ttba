# ✅ Déploiement GitHub Pages - Statut

## 🎯 Résumé rapide

**Application :** TTBA Frontend (Vue 3 + Vite)  
**Repo :** https://github.com/shitori/ttba  
**Site :** https://shitori.github.io/ttba  

---

## 📊 Statut du déploiement

| Étape | Statut | Notes |
|-------|--------|-------|
| ✅ Vite Config | Fait | `base: '/ttba/'` configuré |
| ✅ Package.json | Fait | Scripts de deploy + homepage |
| ✅ GitHub Actions | Fait | Workflow `.github/workflows/deploy.yml` |
| ✅ Git Push | Fait | Changements poussés vers master |
| ⏳ Build CI/CD | En cours | Regarde ci-dessous |
| ⏳ GitHub Pages | À venir | Build en cours → Pages dans 2-3 min |

---

## 🔍 Suivi en direct

### 1. **Voir les Actions en cours**
https://github.com/shitori/ttba/actions

Regarde le workflow "Deploy to GitHub Pages" le plus récent.

### 2. **Après succès du build (~2-3 min)**
Accède à ton site :
- **URL :** https://shitori.github.io/ttba
- **Settings :** https://github.com/shitori/ttba/settings/pages

### 3. **Vérifier les logs**
Si le build échoue, tu verras l'erreur dans les logs des Actions.

---

## 🛠️ Configuration appliquée

### **Fichiers modifiés :**

#### 1. `frontend/vite.config.js`
```javascript
export default defineConfig({
  base: '/ttba/',  // ← Nécessaire pour GitHub Pages
  // ... reste du config
})
```

#### 2. `frontend/package.json`
```json
{
  "homepage": "https://shitori.github.io/ttba",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

#### 3. `.github/workflows/deploy.yml`
Workflow automatique qui :
- S'active à chaque push sur `master`
- Installe les dépendances
- Construit l'app avec Vite
- Pousse le build sur la branche `gh-pages`
- GitHub Pages sert automatiquement

---

## ⚠️ Attention (IMPORTANT)

**Ligne à vérifier/modifier si besoin :**

```yaml
cname: ttba.shitori.dev
```

Cette ligne du workflow crée un fichier `CNAME` sur GitHub Pages.  
- **Si tu as ce domaine :** Laisse-la
- **Si tu n'as pas ce domaine :** Commente ou supprime-la

```yaml
# cname: ttba.shitori.dev  # ← Commente si pas de custom domain
```

---

## 🚀 Prochaines étapes

1. **Attends 2-3 minutes** pour que le build se termine
2. **Accède à :** https://shitori.github.io/ttba
3. **Test la démo :** Charge un JSON d'exemple, lance une partie, vois la vidéo TikTok
4. **Partage le lien** ! 🎉

---

## 📝 Commandes utiles

```powershell
# Voir le statut du repo local
git status

# Voir les commits poussés
git log --oneline origin/master -10

# Pousser manuellement des changements futurs
git push origin master

# Rebaser/mettre à jour
git pull origin master
```

---

## 🆘 Troubleshooting

### **Site ne s'affiche pas après 5 min**
- Regarde les logs Actions : https://github.com/shitori/ttba/actions
- Vérifie les paramètres Pages : https://github.com/shitori/ttba/settings/pages
- Check la ligne `cname` du workflow (voir section "Attention" ci-dessus)

### **Erreur "Cannot find module"**
- Vérifier que `frontend/package.json` a les bonnes dépendances
- Relancer le build localement : `cd frontend && npm install && npm run build`

### **Vidéo TikTok ne s'affiche pas**
- Normal si l'iframe est bloquée par une extension
- Le fallback (bouton "Ouvrir sur TikTok") devrait s'afficher
- Essaie en mode incognito

---

## 📞 Support

Besoin d'aide ?
- Regarde les logs : Actions tab sur GitHub
- Consulte le DEPLOY_GUIDE.md du repo
- Ouvre une issue sur GitHub

---

**Déploiement initié :** 2025-12-23  
**Prochain update :** À chaque `git push origin master`

Enjoy ! 🎮🎉

