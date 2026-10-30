// Loads the game exactly as index.html does: its local <script src> files, in order. The tests run that code in a
// vm context against a small stand-in for Three.js. Each file runs as its own script (like the browser), so a file
// that leans on a later file at load time fails here too.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const dir = path.join(__dirname, '..');
const scripts = () => {
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  return [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]).filter(s => !/^https?:/.test(s));
};
module.exports = function loadGame(ctx) {
  for (const f of scripts()) vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx, { filename: f });
};
module.exports.scripts = scripts;
