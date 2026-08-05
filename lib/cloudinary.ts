import crypto from "crypto";

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
}

/**
 * Upload image/buffer/base64 to Cloudinary using pure REST API & built-in Node crypto module
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  folder: string = "AIRO",
  publicId?: string
): Promise<CloudinaryUploadResult> {
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    "ldke9wua";
  const apiKey = process.env.CLOUDINARY_API_KEY || "343767981279989";
  const apiSecret =
    process.env.CLOUDINARY_API_SECRET || "xPM191F9s3gdRfzxwqjPxqkt7L8";

  const timestamp = Math.floor(Date.now() / 1000).toString();

  let fileString = "";
  if (Buffer.isBuffer(file)) {
    fileString = `data:image/png;base64,${file.toString("base64")}`;
  } else if (typeof file === "string" && file.startsWith("data:")) {
    fileString = file;
  } else if (typeof file === "string" && (file.startsWith("http://") || file.startsWith("https://"))) {
    fileString = file;
  } else {
    fileString = `data:image/png;base64,${file}`;
  }

  // 1. Prepare parameters for signed upload
  const paramsToSign: Record<string, string> = {
    folder,
    timestamp,
  };

  if (publicId) {
    paramsToSign.public_id = publicId;
  }

  // Sort keys alphabetically & generate SHA-1 signature
  const signatureString =
    Object.keys(paramsToSign)
      .sort()
      .map((key) => `${key}=${paramsToSign[key]}`)
      .join("&") + apiSecret;

  const signature = crypto
    .createHash("sha1")
    .update(signatureString)
    .digest("hex");

  // Attempt Signed REST API upload
  try {
    const formData = new FormData();
    formData.append("file", fileString);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", folder);

    if (publicId) {
      formData.append("public_id", publicId);
    }

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    if (res.ok && data.secure_url) {
      return {
        secure_url: data.secure_url,
        public_id: data.public_id,
        format: data.format || "png",
        bytes: data.bytes || 0,
        width: data.width || 0,
        height: data.height || 0,
      };
    }

    console.warn("Signed REST upload error detail:", data);
  } catch (signedErr) {
    console.warn("Signed REST upload exception:", signedErr);
  }

  // 2. Fallback: Try Unsigned Preset REST upload if Signed REST returned permission errors
  const presetsToTry = ["ml_default", "AIRO", "unsigned_preset"];
  for (const preset of presetsToTry) {
    try {
      const formData = new FormData();
      formData.append("file", fileString);
      formData.append("upload_preset", preset);
      formData.append("folder", folder);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (res.ok && data.secure_url) {
        return {
          secure_url: data.secure_url,
          public_id: data.public_id,
          format: data.format || "png",
          bytes: data.bytes || 0,
          width: data.width || 0,
          height: data.height || 0,
        };
      }
    } catch (fallbackErr) {
      console.warn(`Unsigned upload preset '${preset}' failed:`, fallbackErr);
    }
  }

  throw new Error("Gagal mengunggah gambar ke Cloudinary. Pastikan API Key pada Cloudinary Console tidak dibatasi izinnya.");
}

/**
 * Delete image from Cloudinary using image URL or public_id
 */
export async function deleteFromCloudinary(imageSource: string): Promise<boolean> {
  if (!imageSource || typeof imageSource !== "string") return false;
  if (!imageSource.includes("res.cloudinary.com")) return false; // Ignore local images like /images/hero_robot.png

  let publicId = imageSource;
  if (imageSource.includes("/image/upload/")) {
    const parts = imageSource.split("/image/upload/");
    let path = parts[1];
    // Remove version tag if present e.g. v1784716915/
    path = path.replace(/^v\d+\//, "");
    // Remove file extension (.png, .jpg, etc.)
    const lastDotIndex = path.lastIndexOf(".");
    if (lastDotIndex !== -1) {
      path = path.substring(0, lastDotIndex);
    }
    publicId = decodeURIComponent(path);
  }

  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    "ldke9wua";
  const apiKey = process.env.CLOUDINARY_API_KEY || "343767981279989";
  const apiSecret =
    process.env.CLOUDINARY_API_SECRET || "xPM191F9s3gdRfzxwqjPxqkt7L8";

  const timestamp = Math.floor(Date.now() / 1000).toString();

  const paramsToSign: Record<string, string> = {
    public_id: publicId,
    timestamp,
  };

  const signatureString =
    Object.keys(paramsToSign)
      .sort()
      .map((key) => `${key}=${paramsToSign[key]}`)
      .join("&") + apiSecret;

  const signature = crypto
    .createHash("sha1")
    .update(signatureString)
    .digest("hex");

  try {
    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    console.log(`Cloudinary destroy response for '${publicId}':`, data);
    return data.result === "ok";
  } catch (err) {
    console.error("Cloudinary Destroy Error:", err);
    return false;
  }
}