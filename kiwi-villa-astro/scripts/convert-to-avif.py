#!/usr/bin/env python3
"""
將圖片轉換為 AVIF 格式的 Python 腳本
需要先安裝 Pillow 和 pillow-avif-plugin:
pip install Pillow pillow-avif-plugin

使用方法: python3 scripts/convert-to-avif.py
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image
    import pillow_avif  # 這會註冊 AVIF 支援
except ImportError:
    print("❌ 請先安裝必要的套件:")
    print("   pip install Pillow pillow-avif-plugin")
    sys.exit(1)

def convert_to_avif(input_path, output_path, quality=80):
    """將圖片轉換為 AVIF 格式"""
    try:
        # 開啟圖片
        with Image.open(input_path) as img:
            # 如果是 RGBA，轉換為 RGB
            if img.mode == 'RGBA':
                # 創建白色背景
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[3])
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # 儲存為 AVIF
            img.save(output_path, 'AVIF', quality=quality, speed=6)
            print(f"✅ 轉換成功: {Path(output_path).name}")
            return True
    except Exception as e:
        print(f"❌ 轉換失敗 {input_path}: {str(e)}")
        return False

def process_directory(directory):
    """處理目錄中的所有圖片"""
    supported_formats = {'.jpg', '.jpeg', '.png', '.webp'}
    converted_count = 0
    skipped_count = 0
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            file_path = Path(root) / file
            
            # 檢查是否為支援的圖片格式
            if file_path.suffix.lower() in supported_formats:
                # 生成 AVIF 檔案路徑
                avif_path = file_path.with_suffix('.avif')
                
                # 如果 AVIF 已存在，跳過
                if avif_path.exists():
                    print(f"⏭️  跳過 (已存在): {avif_path.name}")
                    skipped_count += 1
                    continue
                
                # 轉換圖片
                if convert_to_avif(file_path, avif_path):
                    converted_count += 1
    
    return converted_count, skipped_count

def main():
    # 設定路徑
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    public_dir = project_root / 'public'
    images_dir = public_dir / 'images'
    
    print("🚀 開始轉換圖片為 AVIF 格式...")
    print(f"📁 處理目錄: {images_dir}")
    
    if not images_dir.exists():
        print(f"❌ 找不到圖片目錄: {images_dir}")
        return
    
    # 處理圖片
    converted, skipped = process_directory(images_dir)
    
    print(f"\n✨ 轉換完成！")
    print(f"   - 新轉換: {converted} 個檔案")
    print(f"   - 已跳過: {skipped} 個檔案")

if __name__ == "__main__":
    main()