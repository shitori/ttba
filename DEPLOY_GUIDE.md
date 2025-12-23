# 🚀 Déploiement GitHub Pages - Guide de configuration

## ✅ Configuration effectuée

J'ai configuré l'application pour GitHub Pages. Voici ce qui a été fait :

### 1. **Vite Config (`frontend/vite.config.js`)**
- Ajout de `base: '/ttba/'` pour servir depuis le chemin GitHub Pages

### 2. **Package.json (`frontend/package.json`)**
- Ajout du champ `homepage`: `https://shitori.github.io/ttba`
- Ajout du champ `repository`
- Scripts de deploy :
  - `npm run predeploy` → construit l'app
  - `npm run deploy` → pousse le build vers GitHub Pages

### 3. **GitHub Actions (`.github/workflows/deploy.yml`)**
- Workflow automatique qui se déclenche à chaque push sur `master`
- Installe les dépendances
- Construit l'app avec Vite
- Déploie automatiquement sur GitHub Pages

---

## 🔧 Configuration requise : Personal Access Token

Pour pousser les changements et déclencher le workflow, tu dois configurer un **GitHub Personal Access Token** :

### Étapes :
1. **Aller sur GitHub** → Paramètres → Developer settings → Personal access tokens → Tokens (classic)
2. **Créer un nouveau token** :
   - Nom : `GITHUB_PAGES_DEPLOY`
   - Expiration : 90 jours (ou plus)
   - Scope : `repo` (accès complet au repo)
3. **Copier le token** (tu ne pourras pas le voir après)
4. **Configurer Git localement** :

```powershell
# Remplacer <TOKEN> par le token généré
cd C:\Users\Antony\WebstormProjects\ttba
git remote set-url origin https://<TOKEN>@github.com/shitori/ttba.git
```

5. **Pousser les changements** :

```powershell
git push origin master
```

---

## 🎯 Après le push

1. **GitHub Actions se déclenche automatiquement**
   - Va sur : https://github.com/shitori/ttba/actions
   - Regarde le workflow "Deploy to GitHub Pages"
   - Attends que le build termine (vert = succès)

2. **Accède à l'app**
   - Site : https://shitori.github.io/ttba
   - Ou (si CNAME configuré) : https://ttba.shitori.dev

3. **Vérifie GitHub Pages settings**
   - Repo → Settings → Pages
   - Source : `Deploy from a branch`
   - Branch : `gh-pages` (créée automatiquement)

---

## ⚠️ Attention

Le workflow inclut une ligne pour un CNAME custom :
```yaml
cname: ttba.shitori.dev
```

Si tu n'as pas ce domaine, **commente ou supprime cette ligne** dans `.github/workflows/deploy.yml`.

---

## 📝 Résumé des fichiers modifiés

- ✅ `frontend/vite.config.js` — base path pour GitHub Pages
- ✅ `frontend/package.json` — scripts et metadata
- ✅ `.github/workflows/deploy.yml` — workflow CI/CD

---

## 🚀 Prochaines étapes

1. Configure le Personal Access Token (voir ci-dessus)
2. Pousse avec : `git push origin master`
3. Attends 2-3 min, puis accède à : **https://shitori.github.io/ttba**

Besoin d'aide ? Dis-moi ! 🎉

