const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const imgPath = path.join(process.cwd(), 'public', 'images', 'logo-airo.png');
const buf = fs.readFileSync(imgPath);

const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);
console.log(`PNG dimensions: ${width}x${height}`);
