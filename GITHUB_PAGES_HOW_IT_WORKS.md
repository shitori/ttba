# ✅ GitHub Pages - Comment ça fonctionne

## 🎯 Situation actuelle

- ✅ Repo GitHub existe: `https://github.com/shitori/ttba`
- ✅ Workflow GitHub Actions configuré : `.github/workflows/deploy.yml`
- ✅ Branche `master` existe avec tout le code source
- ❌ Branche `gh-pages` n'existe PAS encore

## 🔄 Comment GitHub Pages fonctionne

**GitHub Pages a besoin d'une branche spéciale appelée `gh-pages`** qui contient les fichiers HTML/CSS/JS compilés.

Le workflow que j'ai configuré va :
1. ✅ Détecter chaque push vers `master`
2. ✅ Compiler l'app (npm run build)
3. ✅ **Créer automatiquement la branche `gh-pages`** avec les fichiers compilés
4. ✅ GitHub Pages servira alors le contenu

## 🚀 Pour créer la branche `gh-pages`, il faut :

**Option 1 : Le workflow créera la branche automatiquement (RECOMMANDÉ)**
- Fais un petit changement et pousse-le : `git push origin master`
- Le workflow GitHub Actions s'exécutera
- Dans 2-3 min, la branche `gh-pages` sera créée automatiquement
- GitHub Pages servira le site

**Option 2 : Créer manuellement (si tu veux tester tout de suite)**
```bash
# Créer la branche orpheline
git checkout --orphan gh-pages

# Nettoyer tous les fichiers
git rm -rf .

# Copier les fichiers build
cp -r frontend/dist/* .

# Committer
git add .
git commit -m "Deploy: initial GitHub Pages commit"

# Pousser
git push -u origin gh-pages

# Revenir à master
git checkout master
```

## ⚙️ Configuration GitHub Pages

Après que la branche `gh-pages` existe, regarde sur GitHub :

1. Va sur : `https://github.com/shitori/ttba/settings/pages`
2. Vérifie que "Source" est défini sur :
   - Branch: `gh-pages`
   - Folder: `/ (root)`
3. Sauvegarde si tu dois faire des changements

## 📍 URL du site

Quand tout est prêt, le site sera accessible à :
- https://shitori.github.io/ttba

## ✨ Résumé

La branche `gh-pages` va être créée **automatiquement** par le workflow à la prochaine exécution. Pas besoin de faire quoi que ce soit manuellement, sauf si tu veux tester immédiatement.

**Prochaine étape :**
1. Fais un petit changement (ex: modifier README)
2. Pousse-le
3. Attends 2-3 min
4. La branche `gh-pages` sera créée
5. GitHub Pages servira le site !

---

**Créé le :** 2025-12-23  
**Statut :** ✅ Prêt pour le déploiement automatique

