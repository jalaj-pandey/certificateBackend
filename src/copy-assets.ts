import fs from 'fs-extra';
import path from 'path';

const copyAssets = async () => {
  
  const source = path.join(__dirname, '../src/utils/cert.png'); 
  const source1 = path.join(__dirname, '../src/utils/AlegreyaSans-Bold.ttf'); 
  const source2 = path.join(__dirname, '../src/utils/AlexBrush-Regular.ttf'); 
  const destination = path.join(__dirname, '../dist/assets'); 

  try {
    
    console.log(`Source path: ${source}`);
    console.log(`Destination path: ${destination}`);
    console.log(`Source path: ${source1}`);
    console.log(`Destination path: ${destination}`);
    console.log(`Source path: ${source2}`);
    console.log(`Destination path: ${destination}`);

    
    if (!fs.existsSync(source)) {
      throw new Error(`Source directory does not exist: ${source}`);
    }
    if (!fs.existsSync(source1)) {
      throw new Error(`Source directory does not exist: ${source1}`);
    }
    if (!fs.existsSync(source2)) {
      throw new Error(`Source directory does not exist: ${source2}`);
    }

    
    await fs.ensureDir(destination);

    
    await fs.copy(source, destination);
    console.log('Assets copied successfully.');
    await fs.copy(source1, destination);
    console.log('Assets copied successfully.');
    await fs.copy(source2, destination);
    console.log('Assets copied successfully.');
  } catch (err) {
    console.error('Error copying assets:', err);
  }
};


copyAssets();
