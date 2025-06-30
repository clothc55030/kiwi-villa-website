#!/bin/bash

# 圖片轉換腳本 - 將 WebP/JPG 轉換為 AVIF
# 需要安裝 ImageMagick 或 ffmpeg

echo "🚀 開始轉換圖片為 AVIF 格式..."

# 檢查是否安裝了必要的工具
if command -v magick &> /dev/null; then
    CONVERT_CMD="magick"
    echo "✅ 使用 ImageMagick 進行轉換"
elif command -v convert &> /dev/null; then
    CONVERT_CMD="convert"
    echo "✅ 使用 ImageMagick (convert) 進行轉換"
elif command -v ffmpeg &> /dev/null; then
    CONVERT_CMD="ffmpeg"
    echo "✅ 使用 ffmpeg 進行轉換"
else
    echo "❌ 請先安裝 ImageMagick 或 ffmpeg"
    echo "   Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "   或: sudo apt-get install ffmpeg"
    exit 1
fi

# 設定路徑
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
IMAGES_DIR="$PROJECT_ROOT/public/images"

# 轉換函數
convert_to_avif() {
    local input_file="$1"
    local output_file="${input_file%.*}.avif"
    
    # 如果 AVIF 已存在，跳過
    if [ -f "$output_file" ]; then
        echo "⏭️  跳過 (已存在): $(basename "$output_file")"
        return
    fi
    
    # 根據不同的轉換工具執行
    if [ "$CONVERT_CMD" = "ffmpeg" ]; then
        ffmpeg -i "$input_file" -c:v libaom-av1 -crf 30 -b:v 0 "$output_file" -y &> /dev/null
    else
        # ImageMagick
        $CONVERT_CMD "$input_file" -quality 80 "$output_file" &> /dev/null
    fi
    
    if [ $? -eq 0 ]; then
        echo "✅ 轉換成功: $(basename "$output_file")"
    else
        echo "❌ 轉換失敗: $(basename "$input_file")"
    fi
}

# 找出所有需要轉換的圖片
echo "📁 掃描圖片目錄: $IMAGES_DIR"

# 計數器
converted=0
skipped=0

# 處理 intro 資料夾中的圖片
if [ -d "$IMAGES_DIR/intro" ]; then
    echo ""
    echo "📂 處理 intro 資料夾..."
    for img in "$IMAGES_DIR/intro"/*.{jpg,jpeg,png,webp} 2>/dev/null; do
        if [ -f "$img" ]; then
            convert_to_avif "$img"
            ((converted++))
        fi
    done
fi

# 處理其他圖片資料夾...
# 可以根據需要添加更多資料夾

echo ""
echo "✨ 轉換完成！"
echo "   總共處理: $((converted + skipped)) 個檔案"

# 列出生成的 AVIF 檔案
echo ""
echo "📋 已生成的 AVIF 檔案:"
find "$IMAGES_DIR" -name "*.avif" -type f | sort