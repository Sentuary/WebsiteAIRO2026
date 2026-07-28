const fs = require('fs');
const path = require('path');

const imgPath = path.join(process.cwd(), 'public', 'images', 'logo-airo.png');
const stats = fs.statSync(imgPath);
console.log('Image file size:', stats.size, 'bytes');
