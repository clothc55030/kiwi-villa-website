import sharp from 'sharp';
import { encode } from 'blurhash';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const IMAGE_DIRS = [
  '../public/images/hero',
  '../public/images/rooms',
  '../public/images/intro',
  '../public/images/facilities',
  '../public/images/location'
];

const OUTPUT_FILE = '../src/data/blurhashes.json';

async function generateBlurhash(imagePath) {
  try {
    const { data, info } = await sharp(imagePath)
      .raw()
      .ensureAlpha()
      .resize(32, 32, { fit: 'inside' })
      .toBuffer({ resolveWithObject: true });

    const blurhash = encode(
      new Uint8ClampedArray(data),
      info.width,
      info.height,
      4,
      4
    );

    return { blurhash, width: info.width, height: info.height };
  } catch (error) {
    console.error(`Error processing ${imagePath}:`, error);
    return null;
  }
}

async function processDirectory(dirPath) {
  const fullPath = path.join(__dirname, dirPath);
  const files = await fs.readdir(fullPath);
  const results = {};

  for (const file of files) {
    // 只處理 jpg 檔案（原始圖片）
    if (!file.endsWith('.jpg')) continue;

    const filePath = path.join(fullPath, file);
    const stat = await fs.stat(filePath);
    
    if (stat.isFile()) {
      console.log(`Processing: ${file}`);
      const result = await generateBlurhash(filePath);
      
      if (result) {
        // 使用相對於 public 的路徑作為 key
        const relativePath = path.relative(
          path.join(__dirname, '../public'),
          filePath
        ).replace(/\\/g, '/');
        
        results[relativePath] = result;
      }
    }
  }

  return results;
}

async function main() {
  console.log('Generating blurhashes for images...');
  
  let allResults = {};

  for (const dir of IMAGE_DIRS) {
    try {
      const results = await processDirectory(dir);
      allResults = { ...allResults, ...results };
    } catch (error) {
      console.error(`Error processing directory ${dir}:`, error);
    }
  }

  // 確保輸出目錄存在
  const outputDir = path.join(__dirname, '../src/data');
  await fs.mkdir(outputDir, { recursive: true });

  // 寫入結果
  const outputPath = path.join(__dirname, OUTPUT_FILE);
  await fs.writeFile(
    outputPath,
    JSON.stringify(allResults, null, 2)
  );

  console.log(`\nBlurhashes generated successfully!`);
  console.log(`Total images processed: ${Object.keys(allResults).length}`);
  console.log(`Output saved to: ${outputPath}`);
}

main().catch(console.error);