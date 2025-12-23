import fs from 'fs'
import path from 'path'

export function nojekyllPlugin() {
  return {
    name: 'vite-plugin-nojekyll',
    apply: 'build',
    writeBundle(options) {
      const outDir = options.dir

      // Créer .nojekyll
      const nojekyllPath = path.join(outDir, '.nojekyll')
      fs.writeFileSync(nojekyllPath, '', 'utf-8')
      console.log('✓ Created .nojekyll')

      // Créer 404.html pour SPA
      const notFoundHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>TTBA Game</title>
    <script type="text/javascript">
      var pathSegments = window.location.pathname.split('/').filter(Boolean);
      if (pathSegments[0] === 'ttba' && pathSegments.length > 1) {
        window.location.replace('/ttba/');
      }
    </script>
  </head>
  <body>Redirecting...</body>
</html>`

      const notFoundPath = path.join(outDir, '404.html')
      fs.writeFileSync(notFoundPath, notFoundHtml, 'utf-8')
      console.log('✓ Created 404.html for SPA routing')
    }
  }
}

