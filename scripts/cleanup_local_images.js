const fs = require('fs');
const path = require('path');

const publicImagesDir = path.join(__dirname, '..', 'public', 'images');

function deleteFolderRecursive(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
        console.log(`[DELETED] ${curPath}`);
      }
    });
    fs.rmdirSync(dirPath);
    console.log(`[DELETED DIR] ${dirPath}`);
  }
}

// Delete all contents inside public/images
if (fs.existsSync(publicImagesDir)) {
  fs.readdirSync(publicImagesDir).forEach((file) => {
    const curPath = path.join(publicImagesDir, file);
    if (fs.lstatSync(curPath).isDirectory()) {
      deleteFolderRecursive(curPath);
    } else {
      fs.unlinkSync(curPath);
      console.log(`[DELETED FILE] ${curPath}`);
    }
  });
  console.log('All local image files successfully removed!');
}
