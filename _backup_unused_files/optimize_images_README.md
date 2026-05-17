# 圖片優化腳本使用說明

## 功能特色

✅ **自動壓縮 JPG** - 品質 85%，保持視覺效果
✅ **生成 WebP 格式** - 比 JPG 小 25-35%
✅ **生成 AVIF 格式** - 比 WebP 再小 30-50%
✅ **智慧跳過** - 已經夠小的圖片不處理
✅ **自動備份** - 保留原始檔案到 `images.backup/`
✅ **詳細報告** - 生成優化前後對比報告

## 快速開始

### 1. 檢查環境

```bash
# 檢查 Python 版本（需要 3.7+）
python --version

# 檢查是否已安裝所需套件
pip list | grep -i pillow
```

### 2. 如果需要安裝套件

```bash
pip install Pillow pillow-avif-plugin
```

### 3. 執行優化

```bash
# 方法一：直接執行
python optimize_images.py

# 方法二：在專案根目錄執行
python optimize_images.py
```

## 配置說明

腳本開頭的配置區可以調整：

```python
# 圖片品質設定
QUALITY_SETTINGS = {
    'jpg': 85,      # JPG 品質 (推薦 80-85)
    'webp': 85,     # WebP 品質 (推薦 80-90)
    'avif': 65,     # AVIF 品質 (推薦 60-70)
}

# 檔案大小閾值（只處理大於此大小的檔案）
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

# 要處理的目錄
TARGET_DIRS = [
    'images/hero',
    'images/rooms',
    'images/facilities',
    'images/intro',
]
```

## 使用情境

### 情境 1: 優化所有圖片（推薦）

保持預設配置，直接執行：

```bash
python optimize_images.py
```

### 情境 2: 只優化超大圖片

修改配置：

```python
SIZE_THRESHOLD = {
    'hero': 500,        # 只處理超過 500KB 的
    'rooms': 300,
    'facilities': 200,
    'default': 200,
}
```

### 情境 3: 只壓縮 JPG，不生成新格式

修改配置：

```python
GENERATE_WEBP = False
GENERATE_AVIF = False
```

### 情境 4: 只生成 AVIF（已有 WebP）

修改配置：

```python
GENERATE_WEBP = False
GENERATE_AVIF = True
```

### 情境 5: 高品質保留（犧牲檔案大小）

修改配置：

```python
QUALITY_SETTINGS = {
    'jpg': 90,
    'webp': 90,
    'avif': 75,
}
```

## 執行流程

1. **檢查配置** - 顯示當前設定
2. **確認執行** - 需要輸入 `y` 確認
3. **掃描目錄** - 尋找所有 JPG 檔案
4. **處理圖片** - 依大小排序，從大的開始處理
5. **顯示進度** - 即時顯示每個檔案的處理結果
6. **生成報告** - 顯示總體統計和 TOP 10
7. **儲存報告** - 生成時間戳記報告檔案

## 輸出說明

### 螢幕輸出範例

```
✅ main-hall-environment.jpg
   原始: 2.9 MB
   JPG: 195 KB (節省 2.7 MB, 93.3%)
   WEBP: 142 KB (節省 2.8 MB, 95.1%)
   AVIF: 98 KB (節省 2.8 MB, 96.6%)

⏭️  跳過 (檔案已夠小): room-1.jpg (45.2 KB)
```

### 報告檔案

生成的報告檔案（如 `optimization_report_20251102_143025.txt`）包含：

- 優化統計摘要
- 詳細檔案清單
- 每個格式的檔案大小
- 節省空間排行榜

## 處理後的檔案結構

```
images/
├── hero/
│   ├── main-hall.jpg       ← 已壓縮
│   ├── main-hall.webp      ← 新生成
│   └── main-hall.avif      ← 新生成
└── rooms/
    ├── room-1.jpg          ← 已壓縮
    ├── room-1.webp         ← 新生成
    └── room-1.avif         ← 新生成

images.backup/              ← 原始檔案備份
└── (原始檔案結構)
```

## 安全性

✅ **自動備份** - 原始檔案保留在 `images.backup/`
✅ **確認機制** - 執行前需要確認
✅ **錯誤處理** - 遇到錯誤不會中斷整個流程
✅ **可逆操作** - 隨時可從備份還原

## 還原原始檔案

如果需要還原：

```bash
# Windows
xcopy images.backup\* images\ /E /Y

# Linux/macOS
cp -r images.backup/* images/
```

## 常見問題

### Q1: 執行時出現 "ModuleNotFoundError: No module named 'PIL'"

**A**: 需要安裝 Pillow：
```bash
pip install Pillow pillow-avif-plugin
```

### Q2: AVIF 生成失敗

**A**: 確認已安裝 pillow-avif-plugin：
```bash
pip install pillow-avif-plugin
```

### Q3: 處理後圖片變模糊

**A**: 提高品質設定：
```python
QUALITY_SETTINGS = {
    'jpg': 90,  # 提高到 90
    'webp': 90,
    'avif': 75,
}
```

### Q4: 想要處理更多目錄

**A**: 在配置中添加目錄：
```python
TARGET_DIRS = [
    'images/hero',
    'images/rooms',
    'images/facilities',
    'images/intro',
    'images/location',    # 新增
    'images/reviews',     # 新增
]
```

### Q5: 如何只處理單一目錄

**A**: 修改 `TARGET_DIRS` 只保留一個：
```python
TARGET_DIRS = [
    'images/hero',  # 只處理 hero
]
```

## 預期效果

根據 IMAGE-OPTIMIZATION-ANALYSIS.md 的分析：

| 項目 | 優化前 | 預期優化後 | 改善 |
|------|--------|-----------|------|
| Hero 圖片 | 2.9 MB | ~150 KB | -95% |
| 房型圖片 | 500-1500 KB | 80-150 KB | -70% |
| 設施圖片 | 533-585 KB | 70-100 KB | -80% |
| 總容量 | 59 MB | ~30 MB | -49% |

## 進階使用

### 批次處理特定圖片

建立自訂腳本：

```python
from optimize_images import ImageOptimizer

optimizer = ImageOptimizer()

# 只處理特定檔案
files = [
    'images/hero/main-hall-environment.jpg',
    'images/rooms/premium-twin-room.jpg',
]

for file in files:
    optimizer.optimize_image(file)

optimizer.generate_report()
```

### 整合到 Git Hook

在 `.git/hooks/pre-commit` 中：

```bash
#!/bin/bash
# 自動優化新增的圖片
python optimize_images.py --auto
```

## 技術細節

- **JPG 壓縮**: 使用 MozJPEG 演算法，progressive 掃描
- **WebP 壓縮**: Method 6 (最高品質)
- **AVIF 壓縮**: Speed 4 (平衡速度與品質)
- **色彩空間**: 自動處理 RGBA/LA/P 轉 RGB
- **EXIF 資料**: 自動移除（減少檔案大小）

## 授權

此腳本為澎湖期遇度假會館專案專用工具。

---

**建議**: 第一次執行前，建議先在小範圍測試（例如只處理 `images/hero`），確認效果後再處理全部圖片。
