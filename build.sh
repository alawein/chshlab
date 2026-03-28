#!/usr/bin/env bash
# build.sh — Create Vercel Build Output API v3 structure for static site
set -euo pipefail
python scripts/sync_shared_html.py
rm -rf .vercel/output
mkdir -p .vercel/output/static
cp -r css js index.html paper.html 404.html .vercel/output/static/
[ -d assets ] && cp -r assets .vercel/output/static/
[ -d data ] && cp -r data .vercel/output/static/
[ -d figures ] && cp -r figures .vercel/output/static/
[ -f favicon.ico ] && cp favicon.ico .vercel/output/static/
cat > .vercel/output/config.json << 'CONF'
{"version":3,"cleanUrls":true,"trailingSlash":false,"redirects":[{"source":"/paper.html","destination":"/paper","statusCode":308},{"source":"/index.html","destination":"/","statusCode":308}],"headers":[{"source":"/(.*)", "headers":[{"key":"X-Content-Type-Options","value":"nosniff"},{"key":"X-Frame-Options","value":"DENY"},{"key":"Referrer-Policy","value":"strict-origin-when-cross-origin"}]},{"source":"/assets/(.*)","headers":[{"key":"Cache-Control","value":"public, max-age=31536000, immutable"}]}]}
CONF
echo "Build complete: $(find .vercel/output/static -type f | wc -l) files"
