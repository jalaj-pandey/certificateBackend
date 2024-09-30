import fs from 'fs-extra';
import path from 'path';

const copyAssets = async () => {
  
  const source = path.join(__dirname, '../src/utils'); 
  const destination = path.join(__dirname, '../dist/assets'); 

  try {
    
    console.log(`Source path: ${source}`);
    console.log(`Destination path: ${destination}`);

    
    if (!fs.existsSync(source)) {
      throw new Error(`Source directory does not exist: ${source}`);
    }

    
    await fs.ensureDir(destination);

    
    await fs.copy(source, destination);
    console.log('Assets copied successfully.');
  } catch (err) {
    console.error('Error copying assets:', err);
  }
};


copyAssets();
