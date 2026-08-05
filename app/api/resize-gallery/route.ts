import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import crypto from 'crypto';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'images', 'gallery_level_1.png');
    const fileBuffer = fs.readFileSync(filePath);

    // Compress PNG IDAT or downsample buffer if needed
    let offset = 8; // skip PNG header
    let idatBuffers: Buffer[] = [];
    let ihdrBuffer: Buffer | null = null;
    let otherChunksBefore: Buffer[] = [];
    let otherChunksAfter: Buffer[] = [];

    while (offset < fileBuffer.length) {
      const length = fileBuffer.readUInt32BE(offset);
      const type = fileBuffer.toString('ascii', offset + 4, offset + 8);
      const chunkData = fileBuffer.subarray(offset + 8, offset + 8 + length);
      const fullChunk = fileBuffer.subarray(offset, offset + 12 + length);

      if (type === 'IHDR') {
        ihdrBuffer = fullChunk;
      } else if (type === 'IDAT') {
        idatBuffers.push(chunkData);
      } else if (type === 'IEND') {
        otherChunksAfter.push(fullChunk);
      } else {
        if (idatBuffers.length === 0) {
          otherChunksBefore.push(fullChunk);
        } else {
          otherChunksAfter.push(fullChunk);
        }
      }
      offset += 12 + length;
    }

    const combinedIDAT = Buffer.concat(idatBuffers);
    const uncompressedData = zlib.inflateSync(combinedIDAT);
    const recompressedIDAT = zlib.deflateSync(uncompressedData, { level: 9 });

    // Build new IDAT chunk
    const newIDATLen = Buffer.alloc(4);
    newIDATLen.writeUInt32BE(recompressedIDAT.length, 0);
    const newIDATType = Buffer.from('IDAT', 'ascii');
    
    // CRC calculation helper
    const crcTable: number[] = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      crcTable[n] = c;
    }

    function calcCRC(buf: Buffer) {
      let c = 0xffffffff;
      for (let i = 0; i < buf.length; i++) {
        c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
      }
      return (c ^ 0xffffffff) >>> 0;
    }

    const idatTypeAndData = Buffer.concat([newIDATType, recompressedIDAT]);
    const crcVal = calcCRC(idatTypeAndData);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crcVal, 0);

    const newIDATChunk = Buffer.concat([newIDATLen, idatTypeAndData, crcBuf]);

    const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const finalPng = Buffer.concat([
      pngHeader,
      ihdrBuffer!,
      ...otherChunksBefore,
      newIDATChunk,
      ...otherChunksAfter,
    ]);

    fs.writeFileSync(filePath, finalPng);

    // Upload recompressed PNG to Cloudinary
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
    const apiKey = process.env.CLOUDINARY_API_KEY || '';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || '';

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = 'AIRO/main';
    const public_id = 'gallery_level_1';

    const signatureString = `folder=${folder}&public_id=${public_id}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

    const formData = new FormData();
    const dataUri = `data:image/png;base64,${finalPng.toString('base64')}`;
    formData.append('file', dataUri);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('folder', folder);
    formData.append('public_id', public_id);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    return NextResponse.json({
      success: true,
      originalSize: fileBuffer.length,
      compressedSize: finalPng.length,
      url: data.secure_url,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
