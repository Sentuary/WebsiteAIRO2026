import crypto from 'crypto';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'f2tewygu';
const apiKey = process.env.CLOUDINARY_API_KEY || '321599972144246';
const apiSecret = process.env.CLOUDINARY_API_SECRET || 'g9pxfXZWOGa4C47BoKW9twBr1Dw';

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
}

/**
 * Upload image/buffer/base64 to Cloudinary using REST API
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  folder: string = 'jmk-website',
  publicId?: string
): Promise<CloudinaryUploadResult> {
  const timestamp = Math.floor(Date.now() / 1000).toString();

  // Convert Buffer to Base64 Data URI if Buffer
  let fileString = '';
  if (Buffer.isBuffer(file)) {
    fileString = `data:image/png;base64,${file.toString('base64')}`;
  } else if (typeof file === 'string') {
    if (file.startsWith('data:')) {
      fileString = file;
    } else {
      fileString = `data:image/png;base64,${file}`;
    }
  }

  // Create signature params
  const params: Record<string, string> = {
    folder,
    timestamp,
  };
  if (publicId) {
    params.public_id = publicId;
  }

  // Sort keys alphabetically for signature
  const sortedKeys = Object.keys(params).sort();
  const signatureString = sortedKeys.map((key) => `${key}=${params[key]}`).join('&') + apiSecret;
  const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

  // Prepare FormData
  const formData = new FormData();
  formData.append('file', fileString);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  formData.append('folder', folder);
  if (publicId) {
    formData.append('public_id', publicId);
  }

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Failed to upload to Cloudinary');
  }

  return {
    secure_url: data.secure_url,
    public_id: data.public_id,
    format: data.format,
    bytes: data.bytes,
    width: data.width,
    height: data.height,
  };
}
