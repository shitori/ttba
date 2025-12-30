import { ref } from 'vue';
import packageJson from '../../package.json';

/**
 * Composable pour gérer la version de l'application
 *
 * ✅ La version est automatiquement récupérée depuis package.json
 *
 * Pour mettre à jour la version :
 * 1. Modifiez uniquement la version dans frontend/package.json
 * 2. La version s'affichera automatiquement dans l'application
 *
 * Format de version : MAJOR.MINOR.PATCH (ex: 1.0.0)
 */
const APP_VERSION = packageJson.version;

export function useAppVersion() {
  const version = ref(APP_VERSION);

  return {
    version
  };
}

