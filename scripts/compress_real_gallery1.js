const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const filePath = path.join(__dirname, '..', 'public', 'images', 'gallery_level_1.png');
const fileBuffer = fs.readFileSync(filePath);

console.log('Original size:', fileBuffer.length);

let offset = 8;
let width = 0;
let height = 0;
let bitDepth = 0;
let colorType = 0;
let ihdrChunk = null;
let idatChunks = [];

while (offset < fileBuffer.length) {
  const len = fileBuffer.readUInt32BE(offset);
  const type = fileBuffer.toString('ascii', offset + 4, offset + 8);
  const data = fileBuffer.subarray(offset + 8, offset + 8 + len);

  if (type === 'IHDR') {
    width = data.readUInt32BE(0);
    height = data.readUInt32BE(4);
    bitDepth = data[8];
    colorType = data[9];
    ihdrChunk = data;
    console.log(`PNG Dimensions: ${width}x${height}, BitDepth: ${bitDepth}, ColorType: ${colorType}`);
  } else if (type === 'IDAT') {
    idatChunks.push(data);
  }
  offset += 12 + len;
}

// Inflate raw scanlines
const compressedIDAT = Buffer.concat(idatChunks);
const rawScanlines = zlib.inflateSync(compressedIDAT);
console.log('Uncompressed scanlines length:', rawScanlines.length);

// If RGB (colorType 2, 3 bytes/pixel) or RGBA (colorType 6, 4 bytes/pixel)
const bytesPerPixel = colorType === 6 ? 4 : 3;
const scanlineStride = 1 + width * bytesPerPixel;

const newWidth = Math.floor(width / 2);
const newHeight = Math.floor(height / 2);
const newScanlineStride = 1 + newWidth * bytesPerPixel;
const newRawData = Buffer.alloc(newHeight * newScanlineStride);

for (let y = 0; y < newHeight; y++) {
  const srcY = y * 2;
  const srcOffset = srcY * scanlineStride;
  const dstOffset = y * newScanlineStride;

  // Set filter type byte to 0 (None)
  newRawData[dstOffset] = 0;

  for (let x = 0; x < newWidth; x++) {
    const srcX = x * 2;
    const srcPixelIdx = srcOffset + 1 + srcX * bytesPerPixel;
    const dstPixelIdx = dstOffset + 1 + x * bytesPerPixel;

    for (let c = 0; c < bytesPerPixel; c++) {
      newRawData[dstPixelIdx + c] = rawScanlines[srcPixelIdx + c] || 0;
    }
  }
}

// Compress new scanlines
const newCompressedIDAT = zlib.deflateSync(newRawData, { level: 9 });
console.log('New compressed IDAT size:', newCompressedIDAT.length);

// Build new IHDR chunk data
const newIhdrData = Buffer.from(ihdrChunk);
newIhdrData.writeUInt32BE(newWidth, 0);
newIhdrData.writeUInt32BE(newHeight, 4);

// CRC Helper
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}
function calcCRC(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(typeStr, dataBuf) {
  const typeBuf = Buffer.from(typeStr, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(dataBuf.length, 0);
  const typeAndData = Buffer.concat([typeBuf, dataBuf]);
  const crcVal = calcCRC(typeAndData);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);
  return Buffer.concat([lenBuf, typeAndData, crcBuf]);
}

const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const ihdrChunkFinal = makeChunk('IHDR', newIhdrData);
const idatChunkFinal = makeChunk('IDAT', newCompressedIDAT);
const iendChunkFinal = makeChunk('IEND', Buffer.alloc(0));

const finalPNG = Buffer.concat([header, ihdrChunkFinal, idatChunkFinal, iendChunkFinal]);

fs.writeFileSync(filePath, finalPNG);
console.log('Saved downsampled PNG size:', finalPNG.length);
