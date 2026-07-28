const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const imgPath = path.join(process.cwd(), 'public', 'images', 'logo-airo.png');
const fileBuffer = fs.readFileSync(imgPath);

let offset = 8;
let ihdrChunk = null;
let idatBuffers = [];
let paletteBuf = null;
let trnsBuf = null;

while (offset < fileBuffer.length) {
  const length = fileBuffer.readUInt32BE(offset);
  const type = fileBuffer.toString('ascii', offset + 4, offset + 8);
  const chunkData = fileBuffer.subarray(offset + 8, offset + 8 + length);

  if (type === 'IHDR') {
    ihdrChunk = chunkData;
  } else if (type === 'PLTE') {
    paletteBuf = chunkData;
  } else if (type === 'tRNS') {
    trnsBuf = chunkData;
  } else if (type === 'IDAT') {
    idatBuffers.push(chunkData);
  }
  offset += 12 + length;
}

const width = ihdrChunk.readUInt32BE(0);
const height = ihdrChunk.readUInt32BE(4);
const bitDepth = ihdrChunk[8];
const colorType = ihdrChunk[9];

console.log(`Width: ${width}, Height: ${height}, BitDepth: ${bitDepth}, ColorType: ${colorType}`);
