del /s /q "./dist"
copy "./cookies.json" "./dist/cookies.json"
nexe -n main.js -o dist/main --resources "node_modules" --resource "1x1.png"
