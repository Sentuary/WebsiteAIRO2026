const fs = require('fs');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const imageMapping = {};

async function uploadFile(filePath, folder) {
  const fileName = path.basename(filePath);
  const publicId = path.parse(fileName).name;

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `jmk-website/${folder}`,
      public_id: publicId,
      overwrite: true,
    });
    console.log(`[SUCCESS] ${filePath} => ${result.secure_url}`);
    return result.secure_url;
  } catch (err) {
    console.error(`[ERROR] Failed to upload ${filePath}:`, err);
    return null;
  }
}

async function run() {
  const baseDir = path.join(__dirname, '..', 'public', 'images');

  // Root images
  const rootFiles = [
    'AI-Fantasy-Zoo.png',
    'AI-Smart-Life.png',
    'Poster-1.png',
    'Poster-2.png',
    'Ukit-Advance.png',
    'gallery_level_1.png',
    'gallery_level_2.png',
    'gallery_level_3.jpg',
    'hero_robot.png',
  ];

  for (const f of rootFiles) {
    const fullPath = path.join(baseDir, f);
    if (fs.existsSync(fullPath)) {
      const url = await uploadFile(fullPath, 'main');
      if (url) imageMapping[`/images/${f}`] = url;
    }
  }

  // Pembimbing images
  const pembimbingDir = path.join(baseDir, 'pembimbing');
  if (fs.existsSync(pembimbingDir)) {
    const pFiles = fs.readdirSync(pembimbingDir);
    for (const f of pFiles) {
      const fullPath = path.join(pembimbingDir, f);
      if (fs.statSync(fullPath).isFile()) {
        const url = await uploadFile(fullPath, 'pembimbing');
        if (url) imageMapping[`/images/pembimbing/${f}`] = url;
      }
    }
  }

  // Pengajar images
  const pengajarDir = path.join(baseDir, 'pengajar');
  if (fs.existsSync(pengajarDir)) {
    const pFiles = fs.readdirSync(pengajarDir);
    for (const f of pFiles) {
      const fullPath = path.join(pengajarDir, f);
      if (fs.statSync(fullPath).isFile()) {
        const url = await uploadFile(fullPath, 'pengajar');
        if (url) imageMapping[`/images/pengajar/${f}`] = url;
      }
    }
  }

  fs.writeFileSync(
    path.join(__dirname, 'cloudinary_mapping.json'),
    JSON.stringify(imageMapping, null, 2)
  );
  console.log('Mapping file created at scripts/cloudinary_mapping.json');
}

run();
