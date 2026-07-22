const fs = require('fs');
const path = require('path');
const http = require('http');

// Simple script to compress gallery_level_1.png using Cloudinary fetch or resizing
const filePath = path.join(__dirname, '..', 'public', 'images', 'gallery_level_1.png');
const targetPath = path.join(__dirname, '..', 'public', 'images', 'gallery_level_1.png');

console.log('Original size:', fs.statSync(filePath).size);
