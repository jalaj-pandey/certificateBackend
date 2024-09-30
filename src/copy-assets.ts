import fs from 'fs-extra';
import path from 'path';

const copyAssets = async () => {
  
  const source = path.join(__dirname, 'src', 'assets'); 
  const destination = path.join(__dirname, 'dist', 'assets'); 

  try {
    await fs.copy(source, destination);
    console.log('Assets copied successfully.');
  } catch (err) {
    console.error('Error copying assets:', err);
  }
};

copyAssets();
