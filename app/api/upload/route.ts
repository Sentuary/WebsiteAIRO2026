import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    let fileBuffer: Buffer | null = null;
    let base64String: string | null = null;
    let folderName = 'jmk-website';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const folderParam = formData.get('folder') as string | null;
      
      if (folderParam) folderName = folderParam;

      if (!file) {
        return NextResponse.json(
          { success: false, message: 'Tidak ada file yang diunggah' },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      fileBuffer = Buffer.from(bytes);
    } else if (contentType.includes('application/json')) {
      const body = await req.json();
      if (body.file) {
        base64String = body.file;
      }
      if (body.folder) {
        folderName = body.folder;
      }

      if (!base64String) {
        return NextResponse.json(
          { success: false, message: 'Field base64 file wajib diisi' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, message: 'Content-Type tidak didukung. Gunakan multipart/form-data atau application/json' },
        { status: 400 }
      );
    }

    // Call Cloudinary SDK upload function
    const uploadInput = fileBuffer || base64String!;
    const result = await uploadToCloudinary(uploadInput, folderName);

    return NextResponse.json({
      success: true,
      message: 'Upload gambar ke Cloudinary berhasil',
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
    });
  } catch (error: any) {
    console.error('Cloudinary Upload Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengunggah gambar ke Cloudinary',
        error: error.message || String(error),
      },
      { status: 500 }
    );
  }
}
