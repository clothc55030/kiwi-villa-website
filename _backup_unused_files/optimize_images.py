#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
澎湖期遇度假會館 - 圖片批次優化腳本
功能：
1. 壓縮 JPG/PNG 圖片
2. 生成 WebP 格式
3. 生成 AVIF 格式
4. 保留原始檔案（可選）
5. 生成優化報告
"""

import os
import sys
from pathlib import Path
from PIL import Image
import pillow_avif
from datetime import datetime
import shutil

# 修正 Windows 編碼問題
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# ==================== 配置區 ====================

# 圖片品質設定
QUALITY_SETTINGS = {
    'jpg': 85,      # JPG 品質 (1-100)
    'webp': 85,     # WebP 品質 (1-100)
    'avif': 65,     # AVIF 品質 (1-100)，AVIF 在較低品質下也能保持不錯的效果
}

# 檔案大小閾值（只處理大於此大小的檔案，單位：KB）
SIZE_THRESHOLD = {
    'hero': 200,        # Hero 圖片超過 200KB 才處理
    'rooms': 150,       # 房型圖片超過 150KB 才處理
    'facilities': 100,  # 設施圖片超過 100KB 才處理
    'default': 100,     # 其他圖片超過 100KB 才處理
}

# 是否生成新格式
GENERATE_WEBP = True
GENERATE_AVIF = True

# 是否備份原始檔案
CREATE_BACKUP = True
BACKUP_DIR = 'images.backup'

# 要處理的目錄（相對於腳本位置）
TARGET_DIRS = [
    'images/hero',
    'images/rooms',
    'images/facilities',
    'images/intro',
]

# ==================== 主程式 ====================

class ImageOptimizer:
    def __init__(self):
        self.stats = {
            'processed': 0,
            'skipped': 0,
            'errors': 0,
            'original_size': 0,
            'optimized_size': 0,
            'files': []
        }

    def get_size_threshold(self, file_path):
        """根據檔案路徑決定大小閾值"""
        path_str = str(file_path).lower()
        if 'hero' in path_str:
            return SIZE_THRESHOLD['hero'] * 1024
        elif 'rooms' in path_str:
            return SIZE_THRESHOLD['rooms'] * 1024
        elif 'facilities' in path_str:
            return SIZE_THRESHOLD['facilities'] * 1024
        else:
            return SIZE_THRESHOLD['default'] * 1024

    def format_size(self, size_bytes):
        """格式化檔案大小顯示"""
        if size_bytes < 1024:
            return f"{size_bytes} B"
        elif size_bytes < 1024 * 1024:
            return f"{size_bytes / 1024:.1f} KB"
        else:
            return f"{size_bytes / (1024 * 1024):.2f} MB"

    def optimize_image(self, input_path):
        """優化單一圖片"""
        input_path = Path(input_path)

        # 檢查檔案是否存在
        if not input_path.exists():
            print(f"❌ 檔案不存在: {input_path}")
            self.stats['errors'] += 1
            return False

        # 取得原始檔案大小
        original_size = input_path.stat().st_size
        threshold = self.get_size_threshold(input_path)

        # 檢查是否需要處理
        if original_size < threshold:
            print(f"⏭️  跳過 (檔案已夠小): {input_path.name} ({self.format_size(original_size)})")
            self.stats['skipped'] += 1
            return False

        try:
            # 開啟圖片
            with Image.open(input_path) as img:
                # 轉換 RGBA 到 RGB（處理 PNG 透明度）
                if img.mode in ('RGBA', 'LA', 'P'):
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'P':
                        img = img.convert('RGBA')
                    background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                    img = background
                elif img.mode != 'RGB':
                    img = img.convert('RGB')

                # 準備輸出路徑
                output_base = input_path.stem
                output_dir = input_path.parent

                optimized_sizes = {}

                # 1. 壓縮原始 JPG
                if input_path.suffix.lower() in ['.jpg', '.jpeg']:
                    output_jpg = output_dir / f"{output_base}.jpg"

                    # 如果啟用備份，先備份原始檔案
                    if CREATE_BACKUP:
                        backup_path = Path(BACKUP_DIR) / input_path.relative_to('images')
                        backup_path.parent.mkdir(parents=True, exist_ok=True)
                        shutil.copy2(input_path, backup_path)

                    img.save(
                        output_jpg,
                        'JPEG',
                        quality=QUALITY_SETTINGS['jpg'],
                        optimize=True,
                        progressive=True
                    )
                    optimized_sizes['jpg'] = output_jpg.stat().st_size

                # 2. 生成 WebP
                if GENERATE_WEBP:
                    output_webp = output_dir / f"{output_base}.webp"
                    img.save(
                        output_webp,
                        'WEBP',
                        quality=QUALITY_SETTINGS['webp'],
                        method=6  # 最高壓縮品質
                    )
                    optimized_sizes['webp'] = output_webp.stat().st_size

                # 3. 生成 AVIF
                if GENERATE_AVIF:
                    output_avif = output_dir / f"{output_base}.avif"
                    img.save(
                        output_avif,
                        'AVIF',
                        quality=QUALITY_SETTINGS['avif'],
                        speed=4  # 壓縮速度 (0-10，越小越慢但效果越好)
                    )
                    optimized_sizes['avif'] = output_avif.stat().st_size

                # 統計
                final_size = min(optimized_sizes.values()) if optimized_sizes else original_size
                self.stats['processed'] += 1
                self.stats['original_size'] += original_size
                self.stats['optimized_size'] += final_size

                # 記錄檔案資訊
                file_info = {
                    'path': str(input_path),
                    'original_size': original_size,
                    'optimized_sizes': optimized_sizes,
                    'savings': original_size - final_size,
                    'savings_percent': ((original_size - final_size) / original_size * 100) if original_size > 0 else 0
                }
                self.stats['files'].append(file_info)

                # 顯示結果
                print(f"✅ {input_path.name}")
                print(f"   原始: {self.format_size(original_size)}")
                for fmt, size in optimized_sizes.items():
                    savings = original_size - size
                    percent = (savings / original_size * 100) if original_size > 0 else 0
                    print(f"   {fmt.upper()}: {self.format_size(size)} (節省 {self.format_size(savings)}, {percent:.1f}%)")

                return True

        except Exception as e:
            print(f"❌ 處理失敗: {input_path.name}")
            print(f"   錯誤: {str(e)}")
            self.stats['errors'] += 1
            return False

    def process_directory(self, directory):
        """處理目錄中的所有圖片"""
        directory = Path(directory)

        if not directory.exists():
            print(f"⚠️  目錄不存在: {directory}")
            return

        print(f"\n📁 處理目錄: {directory}")
        print("=" * 60)

        # 尋找所有圖片檔案
        image_files = []
        for ext in ['*.jpg', '*.jpeg', '*.JPG', '*.JPEG']:
            image_files.extend(directory.glob(ext))

        # 遞迴尋找子目錄中的圖片
        for ext in ['*.jpg', '*.jpeg', '*.JPG', '*.JPEG']:
            image_files.extend(directory.rglob(ext))

        # 去重
        image_files = list(set(image_files))

        if not image_files:
            print("⚠️  未找到圖片檔案")
            return

        print(f"找到 {len(image_files)} 個圖片檔案\n")

        # 依檔案大小排序（大的先處理）
        image_files.sort(key=lambda x: x.stat().st_size, reverse=True)

        # 處理每個檔案
        for img_file in image_files:
            self.optimize_image(img_file)

    def generate_report(self):
        """生成優化報告"""
        print("\n" + "=" * 60)
        print("📊 優化報告")
        print("=" * 60)

        print(f"\n處理檔案數: {self.stats['processed']}")
        print(f"跳過檔案數: {self.stats['skipped']}")
        print(f"錯誤檔案數: {self.stats['errors']}")

        if self.stats['processed'] > 0:
            total_savings = self.stats['original_size'] - self.stats['optimized_size']
            savings_percent = (total_savings / self.stats['original_size'] * 100) if self.stats['original_size'] > 0 else 0

            print(f"\n原始總大小: {self.format_size(self.stats['original_size'])}")
            print(f"優化後大小: {self.format_size(self.stats['optimized_size'])}")
            print(f"節省空間: {self.format_size(total_savings)} ({savings_percent:.1f}%)")

            # 顯示節省最多的前 10 個檔案
            if self.stats['files']:
                print("\n🏆 節省空間最多的檔案 TOP 10:")
                sorted_files = sorted(self.stats['files'], key=lambda x: x['savings'], reverse=True)[:10]
                for i, file_info in enumerate(sorted_files, 1):
                    filename = Path(file_info['path']).name
                    savings = self.format_size(file_info['savings'])
                    percent = file_info['savings_percent']
                    print(f"{i:2d}. {filename:<50} 節省 {savings} ({percent:.1f}%)")

        # 儲存報告到檔案
        self.save_report()

        print("\n✅ 優化完成！")
        if CREATE_BACKUP:
            print(f"📦 原始檔案已備份至: {BACKUP_DIR}/")

    def save_report(self):
        """儲存詳細報告到檔案"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        report_file = Path(f'optimization_report_{timestamp}.txt')

        with open(report_file, 'w', encoding='utf-8') as f:
            f.write("澎湖期遇度假會館 - 圖片優化報告\n")
            f.write("=" * 80 + "\n")
            f.write(f"生成時間: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")

            f.write(f"處理檔案數: {self.stats['processed']}\n")
            f.write(f"跳過檔案數: {self.stats['skipped']}\n")
            f.write(f"錯誤檔案數: {self.stats['errors']}\n\n")

            if self.stats['processed'] > 0:
                total_savings = self.stats['original_size'] - self.stats['optimized_size']
                savings_percent = (total_savings / self.stats['original_size'] * 100) if self.stats['original_size'] > 0 else 0

                f.write(f"原始總大小: {self.format_size(self.stats['original_size'])}\n")
                f.write(f"優化後大小: {self.format_size(self.stats['optimized_size'])}\n")
                f.write(f"節省空間: {self.format_size(total_savings)} ({savings_percent:.1f}%)\n\n")

                f.write("詳細檔案清單:\n")
                f.write("-" * 80 + "\n")

                for file_info in sorted(self.stats['files'], key=lambda x: x['savings'], reverse=True):
                    filename = Path(file_info['path']).name
                    f.write(f"\n檔案: {filename}\n")
                    f.write(f"  原始大小: {self.format_size(file_info['original_size'])}\n")
                    for fmt, size in file_info['optimized_sizes'].items():
                        f.write(f"  {fmt.upper()}: {self.format_size(size)}\n")
                    f.write(f"  節省: {self.format_size(file_info['savings'])} ({file_info['savings_percent']:.1f}%)\n")

        print(f"\n📄 詳細報告已儲存至: {report_file}")


def main():
    print("=" * 60)
    print("澎湖期遇度假會館 - 圖片批次優化工具")
    print("=" * 60)
    print(f"\n配置:")
    print(f"  JPG 品質: {QUALITY_SETTINGS['jpg']}%")
    print(f"  WebP 品質: {QUALITY_SETTINGS['webp']}%")
    print(f"  AVIF 品質: {QUALITY_SETTINGS['avif']}%")
    print(f"  生成 WebP: {'是' if GENERATE_WEBP else '否'}")
    print(f"  生成 AVIF: {'是' if GENERATE_AVIF else '否'}")
    print(f"  建立備份: {'是' if CREATE_BACKUP else '否'}")

    # 確認是否繼續
    print("\n⚠️  請確認以上配置是否正確")
    response = input("是否繼續? (y/n): ").lower()

    if response != 'y':
        print("❌ 已取消")
        sys.exit(0)

    # 建立優化器
    optimizer = ImageOptimizer()

    # 處理指定目錄
    for target_dir in TARGET_DIRS:
        optimizer.process_directory(target_dir)

    # 生成報告
    optimizer.generate_report()


if __name__ == '__main__':
    main()
