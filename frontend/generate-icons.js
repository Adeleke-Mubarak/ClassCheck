import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 512x512 Master PWA Icon (Used for 512x512, 192x192, and Apple Touch Icon)
// Spec: Android adaptive/maskable safe zone is inner circle radius 204px (center 256, 256).
// Everything important is contained within radius 165px.
const svgIcon512 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient: Deep obsidian black with subtle midnight navy glow -->
    <radialGradient id="bgGlow" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#141824"/>
      <stop offset="55%" stop-color="#0A0C10"/>
      <stop offset="100%" stop-color="#050608"/>
    </radialGradient>

    <!-- C1 Gradient: High-contrast crisp white to platinum -->
    <linearGradient id="c1White" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#D1D5DB"/>
    </linearGradient>

    <!-- C2 Gradient: ClassCheck signature vibrant electric blue -->
    <linearGradient id="c2Blue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60A5FA"/>
      <stop offset="45%" stop-color="#2563EB"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </linearGradient>

    <!-- Beacon Dot Gradient -->
    <linearGradient id="dotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#93C5FD"/>
      <stop offset="100%" stop-color="#3B82F6"/>
    </linearGradient>

    <!-- Soft Depth Shadow for 3D Overlap -->
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="-3" dy="5" stdDeviation="8" flood-color="#000000" flood-opacity="0.75" />
    </filter>

    <!-- Beacon Glow -->
    <filter id="beaconGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- Center Ambient Flare -->
    <radialGradient id="centerFlare" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#2563EB" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#2563EB" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Edge-to-edge solid background (vital for Android maskable icon cropping) -->
  <rect width="512" height="512" fill="url(#bgGlow)"/>

  <!-- Subtle ambient glow in center -->
  <circle cx="256" cy="256" r="150" fill="url(#centerFlare)"/>

  <!-- Subtle squircle border (visible on unmasked platforms) -->
  <rect x="20" y="20" width="472" height="472" rx="108" fill="none" stroke="rgba(255, 255, 255, 0.06)" stroke-width="2"/>

  <!-- Centered CC Monogram Group -->
  <!-- Mathematical center aligned to (256, 256) -->
  <g transform="translate(12, 0)">
    
    <!-- C1: First 'C' (Crisp White / Platinum) -->
    <path d="M 235 174
             A 90 90 0 1 0 235 338"
          fill="none"
          stroke="url(#c1White)"
          stroke-width="36"
          stroke-linecap="round"
          stroke-linejoin="round"
          filter="url(#shadow)" />

    <!-- C2: Second 'C' (Signature ClassCheck Blue) -->
    <path d="M 325 174
             A 90 90 0 1 0 325 338"
          fill="none"
          stroke="url(#c2Blue)"
          stroke-width="36"
          stroke-linecap="round"
          stroke-linejoin="round"
          filter="url(#shadow)" />

    <!-- Live Real-Time Beacon Pulse (Notification Ping) -->
    <circle cx="340" cy="156" r="12" fill="#2563EB" opacity="0.4" filter="url(#beaconGlow)" />
    <circle cx="340" cy="156" r="8" fill="url(#dotGrad)" filter="url(#beaconGlow)" />
    <circle cx="340" cy="156" r="4.5" fill="#FFFFFF" />

  </g>
</svg>`;

// Crisp Favicon SVG for Browser Tabs (32x32 viewbox, pixel-aligned)
const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <defs>
    <linearGradient id="favBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60A5FA"/>
      <stop offset="100%" stop-color="#2563EB"/>
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="7" fill="#0A0C10"/>
  <rect width="32" height="32" rx="7" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
  
  <g transform="translate(0.5, 0)">
    <!-- C1 (White) -->
    <path d="M 14.5 10.5 A 6 6 0 1 0 14.5 21.5" fill="none" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round"/>
    
    <!-- C2 (Blue) -->
    <path d="M 20.5 10.5 A 6 6 0 1 0 20.5 21.5" fill="none" stroke="url(#favBlue)" stroke-width="2.8" stroke-linecap="round"/>
    
    <!-- Pulse dot -->
    <circle cx="21.5" cy="9.2" r="1.3" fill="#60A5FA"/>
    <circle cx="21.5" cy="9.2" r="0.7" fill="#FFFFFF"/>
  </g>
</svg>`;

async function generate() {
  const publicDir = path.join(__dirname, 'public');

  // 1. Write favicon.svg
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgFavicon.trim());
  console.log('✓ Created public/favicon.svg');

  // 2. Generate pwa-512x512.png
  const svgBuffer = Buffer.from(svgIcon512);
  await sharp(svgBuffer)
    .resize(512, 512)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('✓ Created public/pwa-512x512.png (512x512)');

  // 3. Generate pwa-192x192.png
  await sharp(svgBuffer)
    .resize(192, 192)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('✓ Created public/pwa-192x192.png (192x192)');

  // 4. Generate apple-touch-icon.png (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ Created public/apple-touch-icon.png (180x180)');

  console.log('All ClassCheck "CC" brand icons rendered successfully!');
}

generate().catch(console.error);
