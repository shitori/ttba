# 🔧 Correction du problème CORS - Instructions Détaillées

## ❌ Problème Identifié

```
Access-Control-Allow-Origin header has a value 'http://localhost:3000' 
that is not equal to the supplied origin 'https://shitori.github.io'
```

**Cause :** La variable d'environnement `FRONTEND_URL` n'est pas définie dans Railway, donc le backend utilise la valeur par défaut `http://localhost:3000`.

---

## ✅ Solution : Ajouter la variable dans Railway

### Étape 1 : Aller dans le Dashboard Railway

1. Allez sur https://railway.app
2. Connectez-vous
3. Ouvrez votre projet **TTBA**

### Étape 2 : Accéder aux Variables

1. Cliquez sur le service **backend**
2. Allez à l'onglet **Variables** (ou **Environment**)

### Étape 3 : Ajouter la variable FRONTEND_URL

Cliquez sur **+ Add Variable**

Remplissez :
- **Name** : `FRONTEND_URL`
- **Value** : `https://shitori.github.io/ttba`

⚠️ **IMPORTANT :** 
- Remplacez `shitori` par votre username GitHub
- Incluez le `/ttba` à la fin (c'est le base path du vite.config.js)

### Étape 4 : Vérifier que c'est correct

Les variables doivent ressembler à :

| Variable | Valeur |
|----------|--------|
| `PORT` | 8080 (ou assigné automatiquement par Railway) |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://shitori.github.io/ttba` |

### Étape 5 : Redémarrer le service

1. Dans le Dashboard Railway
2. Allez à l'onglet **Deployments**
3. Cliquez sur **Redeploy** ou **Restart**
4. Attendez que le service se redémarre

---

## 🧪 Vérifier que ça fonctionne

### Test 1 : Health Check
```powershell
curl https://ttba-production.up.railway.app/health
```

Vous devez recevoir :
```json
{"status":"OK","timestamp":"2025-01-27T..."}
```

### Test 2 : Vérifier les logs du backend

Dans Railway, allez à l'onglet **Logs** et cherchez :
```
🔧 Configuration:
   PORT: 8080
   FRONTEND_URL: https://shitori.github.io/ttba
```

Si vous voyez `FRONTEND_URL: http://localhost:3000`, c'est que la variable n'a pas été ajoutée correctement.

### Test 3 : Ouvrir votre application

1. Allez sur https://shitori.github.io/ttba
2. Ouvrez la console du navigateur (F12 → Console)
3. Vous ne devriez plus voir d'erreur CORS !

---

## 📝 Résumé des changements du backend

J'ai modifié `backend/server.js` pour :
- Utiliser `FRONTEND_URL` pour les configurations CORS (Express ET Socket.IO)
- Ajouter du logging pour déboguer les problèmes

**Vous devez faire un commit et push :**

```powershell
git add backend/server.js
git commit -m "Fix CORS configuration to properly use FRONTEND_URL"
git push origin main
```

Après le push, Railway va automatiquement redéployer avec le nouveau code.

---

## 🆘 Si ça ne fonctionne toujours pas

1. Vérifiez que votre URL GitHub Pages est correcte
2. Assurez-vous que `FRONTEND_URL` est **exactement** égale à l'URL de votre frontend
3. Vérifiez les logs du backend dans Railway pour les erreurs
4. Attendez 2-3 minutes après le redéploiement pour que les changements prennent effet


