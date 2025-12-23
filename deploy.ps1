#!/usr/bin/env powershell
# Script pour configurer et pousser vers GitHub Pages

Write-Host "=== GitHub Pages Deploy Setup ===" -ForegroundColor Green
Write-Host ""

Write-Host "Option 1: Utiliser un Personal Access Token" -ForegroundColor Cyan
Write-Host "1. Va sur: https://github.com/settings/tokens"
Write-Host "2. Clique 'Generate new token' -> 'Tokens (classic)'"
Write-Host "3. Nom: GITHUB_PAGES_DEPLOY"
Write-Host "4. Scope: 'repo' (accès complet)"
Write-Host "5. Copie le token généré"
Write-Host ""

$token = Read-Host "Colle le token ici"

if ($token -eq "") {
    Write-Host "Pas de token fourni. Abandon." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Configuration de Git..." -ForegroundColor Cyan

# Remplacer l'URL du remote avec le token
$repo = "github.com/shitori/ttba.git"
git remote set-url origin "https://${token}@${repo}"

Write-Host "✓ Remote configuré" -ForegroundColor Green

Write-Host ""
Write-Host "Vérification des changements..." -ForegroundColor Cyan
git status

Write-Host ""
$confirm = Read-Host "Pousser les changements vers master ? (o/n)"

if ($confirm -eq "o" -or $confirm -eq "O") {
    Write-Host "Push en cours..." -ForegroundColor Cyan
    git push origin master

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Push réussi !" -ForegroundColor Green
        Write-Host "GitHub Actions va démarrer automatiquement."
        Write-Host ""
        Write-Host "Actions: https://github.com/shitori/ttba/actions"
        Write-Host "Site: https://shitori.github.io/ttba"
    } else {
        Write-Host "✗ Erreur lors du push" -ForegroundColor Red
    }
} else {
    Write-Host "Push annulé." -ForegroundColor Yellow
}

