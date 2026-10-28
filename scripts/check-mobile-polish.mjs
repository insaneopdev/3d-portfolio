import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [app, css, motion] = await Promise.all([
 readFile('src/App.jsx', 'utf8'),
 readFile('src/mobile-polish.css', 'utf8'),
 readFile('src/LivingMotion.jsx', 'utf8'),
]);

// Regression: keep the existing headline copy and give its italic word room to render.
assert.match(app, /that\s*<em>move<\/em>\s*worlds/);
assert.match(css, /\.hero-copy h1 em\s*\{[^}]*padding-right:\s*0\.14em/s);
assert.match(css, /\.hero-copy h1\s*\{[^}]*overflow:\s*visible\s*!important/s);

// Regression: navigation remains floating and the mobile menu has a real open state.
assert.match(css, /\.site-nav\s*\{[^}]*position:\s*fixed/s);
assert.match(css, /\.nav-links\.nav-links-open\s*\{[^}]*display:\s*flex\s*!important/s);

// Regression: prevent the desktop-positioned 3D annotation from clipping on phones.
assert.match(css, /@media\s*\(max-width:\s*720px\)[\s\S]*?\.scene-project-annotation\s*\{[^}]*display:\s*none/s);
assert.match(css, /\.scene-frame\s*\{[^}]*overflow:\s*hidden/s);
assert.match(css, /\.scene-focus-card\s*\{[^}]*left:\s*10px\s*!important/s);

// Regression: scroll handling is RAF-coalesced and reduced motion is respected.
assert.match(motion, /requestAnimationFrame/);
assert.match(motion, /prefers-reduced-motion:\s*reduce/);
assert.match(css, /prefers-reduced-motion:\s*reduce/);

console.log('Mobile polish regression checks passed.');
