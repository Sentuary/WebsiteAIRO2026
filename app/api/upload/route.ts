import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    let fileBuffer: Buffer | null = null;
    let fileName = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json(
          { success: false, message: 'Tidak ada file yang diunggah' },
          { status: 400 }
        );
      }

      fileName = file.name || '';
      const bytes = await file.arrayBuffer();
      fileBuffer = Buffer.from(bytes);
    } else if (contentType.includes('application/json')) {
      const body = await req.json();
      if (!body.file) {
        return NextResponse.json(
          { success: false, message: 'Field base64 file wajib diisi' },
          { status: 400 }
        );
      }

      const rawBase64 = body.file.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
      fileBuffer = Buffer.from(rawBase64, 'base64');
      fileName = body.fileName || '';
    } else {
      return NextResponse.json(
        { success: false, message: 'Content-Type tidak didukung. Gunakan multipart/form-data atau application/json' },
        { status: 400 }
      );
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Data file gambar kosong' },
        { status: 400 }
      );
    }

    let svgDataUri = '';
    let width = 600;
    let height = 600;

    // 1. Jika file asli sudah berupa SVG
    const isSvg = fileName.toLowerCase().endsWith('.svg') || fileBuffer.subarray(0, 100).toString('utf8').includes('<svg');
    if (isSvg) {
      const svgText = fileBuffer.toString('utf8');
      svgDataUri = `data:image/svg+xml;base64,${Buffer.from(svgText, 'utf8').toString('base64')}`;
    } else {
      // 2. Jika file raster (JPG, PNG, WEBP, dll): Optimasi & bungkus ke dokumen vektor SVG murni
      const resized = await sharp(fileBuffer)
        .rotate()
        .resize({ width: 600, height: 600, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 75, effort: 5 })
        .toBuffer();

      const meta = await sharp(resized).metadata();
      width = meta.width || 600;
      height = meta.height || 600;
      const b64 = resized.toString('base64');

      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"><image width="${width}" height="${height}" href="data:image/webp;base64,${b64}"/></svg>`;
      svgDataUri = `data:image/svg+xml;base64,${Buffer.from(svgContent, 'utf8').toString('base64')}`;
    }

    return NextResponse.json({
      success: true,
      message: 'Gambar berhasil di-switch menjadi SVG untuk penyimpanan langsung di Firebase',
      url: svgDataUri,
      format: 'svg',
      width,
      height,
    });
  } catch (error: any) {
    console.error('Image to SVG Conversion Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengonversi gambar ke format SVG',
        error: error.message || String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  // Gambar disimpan langsung sebagai atribut dokumen di Firestore,
  // sehingga menghapus dokumen otomatis menghapus gambarnya tanpa meninggalkan file sampah.
  return NextResponse.json({
    success: true,
    message: 'Gambar terkelola langsung di dokumen Firestore.',
  });
}
