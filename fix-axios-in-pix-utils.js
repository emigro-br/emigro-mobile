const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'node_modules', 'pix-utils', 'node_modules', 'axios', 'package.json');

const content = fs.readFileSync(target, 'utf8');
const modified = content.replace(
  `"require": "./dist/node/axios.cjs"`,
  `"require": "./dist/browser/axios.cjs"`
);

fs.writeFileSync(target, modified);
console.log('Patched axios inside pix-utils.');
