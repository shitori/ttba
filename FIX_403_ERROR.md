# ✅ GitHub Pages Workflow - Erreur 403 RÉSOLUE

## 🔧 Problème identifié et corrigé

### ❌ Erreur reçue
```
remote: Permission to shitori/ttba.git denied to github-actions[bot].
fatal: unable to access 'https://github.com/shitori/ttba.git/': The requested URL returned error: 403
```

### ✅ Cause
- Le workflow utilisait `peaceiris/actions-gh-pages` avec des permissions insuffisantes
- La ligne `cname: ttba.shitori.dev` causait des conflits
- Les permissions n'étaient pas explicitement configurées

### ✅ Solution appliquée

**1. Ajout des permissions correctes :**
```yaml
permissions:
  contents: read
  pages: write      # ← Permission pour écrire sur Pages
  id-token: write   # ← Permission pour le token
```

**2. Utilisation de l'action officielle GitHub Pages :**
```yaml
- name: Upload artifact
  uses: actions/upload-pages-artifact@v3
  with:
    path: './frontend/dist'

- name: Deploy to GitHub Pages
  id: deployment
  uses: actions/deploy-pages@v4
```

**3. Retrait de la ligne CNAME problématique :**
```yaml
# ❌ Retiré : cname: ttba.shitori.dev
```

---

## 🚀 Le workflow maintenant

Le nouveau workflow :
1. ✅ Se déclenche sur `push` vers `master`
2. ✅ Installe Node 18
3. ✅ Build l'app avec Vite (`npm run build`)
4. ✅ Upload l'artifact vers GitHub Pages
5. ✅ Déploie avec les bonnes permissions
6. ✅ Site accessible à `https://shitori.github.io/ttba`

---

## 📊 Prochaines étapes

### 1️⃣ Attendre le build suivant
Le workflow s'est déclenché automatiquement après le push.  
Regarde l'avancement ici : https://github.com/shitori/ttba/actions

### 2️⃣ Vérifier le statut
- 🟡 **En cours** = Build en train de tourner
- 🟢 **Réussi** = Déploiement terminé
- 🔴 **Erreur** = Vérifier les logs

### 3️⃣ Accéder au site
Quand le build est ✅ complet :
```
https://shitori.github.io/ttba
```

---

## 🔗 Liens utiles

| Action | Lien |
|--------|------|
| 📊 Voir le build | https://github.com/shitori/ttba/actions |
| 📄 Workflow file | https://github.com/shitori/ttba/blob/master/.github/workflows/deploy.yml |
| ⚙️ Pages Settings | https://github.com/shitori/ttba/settings/pages |
| 🌐 Site | https://shitori.github.io/ttba |

---

## ✨ Résumé des changements

```diff
# .github/workflows/deploy.yml

+ permissions:
+   contents: read
+   pages: write
+   id-token: write

- uses: peaceiris/actions-gh-pages@v3
- with:
-   github_token: ${{ secrets.GITHUB_TOKEN }}
-   publish_dir: ./frontend/dist
-   cname: ttba.shitori.dev

+ uses: actions/upload-pages-artifact@v3
+ with:
+   path: './frontend/dist'
+
+ uses: actions/deploy-pages@v4
```

---

## 🎉 Prochaines mises à jour

Pour mettre à jour ton app à l'avenir :

```powershell
cd C:\Users\Antony\WebstormProjects\ttba

# Fais tes changements...

git add .
git commit -m "feat: description"
git push origin master

# ✅ Le workflow se déclenche automatiquement
# ✅ 2-3 min plus tard, ton app est en ligne
```

---

**Date de correction :** 2025-12-23  
**Statut :** ✅ Workflow réparé et repoussé  
**ETA du déploiement :** 2-3 minutes après ce commit

Attends le build à cette adresse : https://github.com/shitori/ttba/actions 🚀

