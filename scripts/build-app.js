const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src', 'app');
const outputPath = path.join(rootDir, 'app.js');

const parts = [
  '00-constants.js',
  '01-globals.js',
  '02-events.js',
  '03-state-normalization.js',
  '04-render.js',
  '05-actions.js',
  '06-pairing.js',
  '07-standings.js',
  '08-lifecycle-utils.js',
  '09-init.js',
];

const missing = parts.filter((part) => !fs.existsSync(path.join(srcDir, part)));
if (missing.length > 0) {
  throw new Error(`Missing source parts: ${missing.join(', ')}`);
}

const header = [
  '// Auto-generated file. Do not edit directly.',
  '// Source: src/app/*.js',
  '',
].join('\n');

const body = parts
  .map((part) => {
    const fullPath = path.join(srcDir, part);
    const content = fs.readFileSync(fullPath, 'utf8').trimEnd();
    return `// ===== ${part} =====\n${content}`;
  })
  .join('\n\n');

fs.writeFileSync(outputPath, `${header}${body}\n`, 'utf8');
console.log(`Built ${outputPath} from ${parts.length} parts.`);
