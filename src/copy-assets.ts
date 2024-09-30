

import fs from 'fs-extra';
import path from 'path';

const src = path.join(__dirname, 'src/assets');
const dest = path.join(__dirname, 'dist/assets');

const copyAssets = async () => {
  try {
    await fs.copy(src, dest);
    console.log('Assets copied successfully!');
  } catch (err) {
    console.error('Error copying assets:', err);
  }
};

copyAssets();
