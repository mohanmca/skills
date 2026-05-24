import os
import json
import shutil
import argparse

def create_pwa_manifest(topic_name, output_dir):
    manifest = {
        "name": f"{topic_name} Study App",
        "short_name": "StudyApp",
        "start_url": "./index.html",
        "display": "standalone",
        "background_color": "#fff8f0",
        "theme_color": "#06b6d4",
        "icons": [
            {
                "src": "assets/icons/icon-192.png",
                "sizes": "192x192",
                "type": "image/png"
            },
            {
                "src": "assets/icons/icon-512.png",
                "sizes": "512x512",
                "type": "image/png"
            }
        ]
    }
    with open(os.path.join(output_dir, "manifest.json"), 'w') as f:
        json.dump(manifest, f, indent=2)

def generate_service_worker(output_dir):
    sw_content = """
const CACHE_NAME = 'study-app-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './styles/study-tokens.css',
  './styles/animations.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
"""
    with open(os.path.join(output_dir, "service-worker.js"), 'w') as f:
        f.write(sw_content.strip())

def main():
    parser = argparse.ArgumentParser(description="Package study app for PWA and offline use.")
    parser.add_argument("--topic", required=True, help="Topic name")
    parser.add_argument("--app-dir", required=True, help="Directory containing the app source")
    args = parser.parse_args()

    # 1. Create Manifest
    create_pwa_manifest(args.topic, args.app_dir)

    # 2. Generate Service Worker
    generate_service_worker(args.app_dir)

    # 3. Copy Shared Assets from Skill Library
    skill_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    library_path = os.path.join(skill_root, "assets", "library")
    
    if os.path.exists(library_path):
        target_styles = os.path.join(args.app_dir, "styles")
        os.makedirs(target_styles, exist_ok=True)
        for item in os.listdir(library_path):
            if item.endswith(".css"):
                shutil.copy2(os.path.join(library_path, item), target_styles)
        print(f"Copied shared CSS tokens to {target_styles}")

    # 4. Copy Icons if they exist in the library
    icon_source = os.path.join(skill_root, "assets", "icons")
    if os.path.exists(icon_source):
        target_icons = os.path.join(args.app_dir, "assets", "icons")
        os.makedirs(target_icons, exist_ok=True)
        for icon in os.listdir(icon_source):
            if icon.endswith(".png") or icon.endswith(".svg"):
                shutil.copy2(os.path.join(icon_source, icon), target_icons)
        print(f"Copied icons to {target_icons}")

    print(f"App '{args.topic}' packaged for PWA in {args.app_dir}")

if __name__ == "__main__":
    main()
