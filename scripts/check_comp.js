const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const filePath = path.join(__dirname, '..', 'public', 'images', 'gallery_level_1.png');
const fileBuf = fs.readFileSync(filePath);

// Simple compression check
console.log('Original size:', fileBuf.length);
