import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const publicImagesDir = path.join(process.cwd(), 'public', 'images');
    const deletedFiles: string[] = [];

    function deleteFolderRecursive(dirPath: string) {
      if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath).forEach((file) => {
          const curPath = path.join(dirPath, file);
          if (fs.lstatSync(curPath).isDirectory()) {
            deleteFolderRecursive(curPath);
          } else {
            fs.unlinkSync(curPath);
            deletedFiles.push(curPath);
          }
        });
        fs.rmdirSync(dirPath);
      }
    }

    if (fs.existsSync(publicImagesDir)) {
      fs.readdirSync(publicImagesDir).forEach((file) => {
        const curPath = path.join(publicImagesDir, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          deleteFolderRecursive(curPath);
        } else {
          fs.unlinkSync(curPath);
          deletedFiles.push(curPath);
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Semua foto lokal di folder public/images yang sudah dipindah ke Cloudinary berhasil dihapus!',
      deletedCount: deletedFiles.length,
      deletedFiles,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
