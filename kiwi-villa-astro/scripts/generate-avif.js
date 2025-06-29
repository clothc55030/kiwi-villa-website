/**
 * 生成 AVIF 圖片格式的腳本
 * 使用前需要安裝 sharp: pnpm add -D sharp
 * 
 * 使用方法: node scripts/generate-avif.js
 */

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');

async function convertToAvif(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .avif({
        quality: 80,
        effort: 4,
        chromaSubsampling: '4:2:0'
      })
      .toFile(outputPath);
    console.log(`✅ Converted: ${path.basename(outputPath)}`);
  } catch (error) {
    console.error(`❌ Error converting ${inputPath}:`, error.message);
  }
}

async function processDirectory(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      await processDirectory(fullPath);
    } else if (file.isFile() && /\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
      const avifPath = fullPath.replace(/\.(jpg|jpeg|png|webp)$/i, '.avif');
      
      // 檢查 AVIF 檔案是否已存在
      try {
        await fs.access(avifPath);
        console.log(`⏭️  Skipping (exists): ${path.basename(avifPath)}`);
      } catch {
        // AVIF 不存在，進行轉換
        await convertToAvif(fullPath, avifPath);
      }
    }
  }
}

async function main() {
  console.log('🚀 Starting AVIF generation...');
  console.log(`📁 Processing images in: ${IMAGES_DIR}`);
  
  try {
    await processDirectory(IMAGES_DIR);
    console.log('✨ AVIF generation complete!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();