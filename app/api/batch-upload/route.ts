import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'active',
    storage: 'Cloudinary CDN',
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'f2tewygu',
  });
}
