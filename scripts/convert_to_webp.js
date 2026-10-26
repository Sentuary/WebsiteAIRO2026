const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imagesDir = path.join(__dirname, '..', 'public', 'images');

async function convertPngToWebp() {
  const files = fs.readdirSync(imagesDir);
  const pngFiles = files.filter(f => f.toLowerCase().endsWith('.png'));

  console.log(`Found ${pngFiles.length} PNG files in ${imagesDir}:`);

  for (const file of pngFiles) {
    const inputPath = path.join(imagesDir, file);
    const baseName = file.substring(0, file.lastIndexOf('.'));
    const outputPath = path.join(imagesDir, `${baseName}.webp`);

    try {
      const originalStats = fs.statSync(inputPath);
      console.log(`\nConverting: ${file} (${(originalStats.size / 1024).toFixed(1)} KB)...`);

      let sharpInstance = sharp(inputPath);

      if (file.toLowerCase().includes('logo')) {
        // High quality with sharp alpha for logos
        await sharpInstance
          .webp({ quality: 95, effort: 6 })
          .toFile(outputPath);
      } else {
        // High quality webp for hero, posters, kits, gallery
        await sharpInstance
          .webp({ quality: 85, effort: 5 })
          .toFile(outputPath);
      }

      const webpStats = fs.statSync(outputPath);
      const savings = (((originalStats.size - webpStats.size) / originalStats.size) * 100).toFixed(1);
      console.log(`  -> Saved: ${baseName}.webp (${(webpStats.size / 1024).toFixed(1)} KB, -${savings}%)`);

      // Verify before deleting
      if (webpStats.size > 0) {
        fs.unlinkSync(inputPath);
        console.log(`  -> Deleted original: ${file}`);
      } else {
        console.error(`  -> ERROR: output file ${outputPath} is empty, skipping delete.`);
      }
    } catch (err) {
      console.error(`Error converting ${file}:`, err);
    }
  }

  console.log('\nAll PNG files converted to WebP and removed successfully.');
}

convertPngToWebp();
