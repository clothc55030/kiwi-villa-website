// CSS 優化腳本 - 移除重複定義並壓縮
const fs = require('fs');
const path = require('path');

// 讀取 CSS 檔案
function readCSS(filename) {
    return fs.readFileSync(path.join('css', filename), 'utf8');
}

// 簡單的 CSS 壓縮
function minifyCSS(css) {
    return css
        // 移除註釋
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // 移除多餘空白
        .replace(/\s+/g, ' ')
        // 移除選擇器前後空白
        .replace(/\s*{\s*/g, '{')
        .replace(/\s*}\s*/g, '}')
        .replace(/\s*:\s*/g, ':')
        .replace(/\s*;\s*/g, ';')
        // 移除最後的分號
        .replace(/;}/g, '}')
        // 移除空規則
        .replace(/[^{}]+{\s*}/g, '')
        .trim();
}

// 解析 CSS 規則
function parseCSS(css) {
    const rules = new Map();
    const mediaQueries = new Map();
    
    // 簡單的 CSS 解析器
    const ruleRegex = /([^{]+){([^}]+)}/g;
    let match;
    
    // 分離媒體查詢和普通規則
    const parts = css.split('@media');
    
    // 處理非媒體查詢部分
    const normalCSS = parts[0];
    while ((match = ruleRegex.exec(normalCSS)) !== null) {
        const selector = match[1].trim();
        const declarations = match[2].trim();
        
        // 合併相同選擇器的規則
        if (rules.has(selector)) {
            rules.set(selector, rules.get(selector) + ';' + declarations);
        } else {
            rules.set(selector, declarations);
        }
    }
    
    // 處理媒體查詢
    for (let i = 1; i < parts.length; i++) {
        const mediaMatch = parts[i].match(/^([^{]+){([\s\S]+)$/);
        if (mediaMatch) {
            const mediaQuery = '@media ' + mediaMatch[1].trim();
            const mediaContent = mediaMatch[2];
            
            // 提取最後的 }
            const lastBrace = mediaContent.lastIndexOf('}');
            const actualContent = mediaContent.substring(0, lastBrace);
            
            if (!mediaQueries.has(mediaQuery)) {
                mediaQueries.set(mediaQuery, []);
            }
            mediaQueries.get(mediaQuery).push(actualContent);
        }
    }
    
    return { rules, mediaQueries };
}

// 合併 CSS 規則
function mergeRules(rulesMap) {
    const merged = [];
    
    for (const [selector, declarations] of rulesMap) {
        // 移除重複的聲明
        const declArray = declarations.split(';').filter(d => d.trim());
        const uniqueDecls = [...new Set(declArray)];
        
        if (uniqueDecls.length > 0) {
            merged.push(`${selector}{${uniqueDecls.join(';')}}`);
        }
    }
    
    return merged.join('');
}

// 主要優化函數
function optimizeCSS() {
    // 讀取 core.css（已經包含 base + layout）
    const coreCSS = readCSS('core.css');
    
    // 解析 CSS
    const { rules, mediaQueries } = parseCSS(coreCSS);
    
    // 合併規則
    let optimizedCSS = mergeRules(rules);
    
    // 添加媒體查詢
    for (const [query, contents] of mediaQueries) {
        optimizedCSS += `${query}{${contents.join('')}}`;
    }
    
    // 壓縮
    const minified = minifyCSS(optimizedCSS);
    
    // 寫入優化後的檔案
    fs.writeFileSync('css/core-optimized.css', minified);
    
    // 顯示結果
    const originalSize = Buffer.byteLength(coreCSS, 'utf8');
    const optimizedSize = Buffer.byteLength(minified, 'utf8');
    const reduction = ((1 - optimizedSize / originalSize) * 100).toFixed(2);
    
    console.log(`原始大小: ${originalSize} bytes`);
    console.log(`優化後大小: ${optimizedSize} bytes`);
    console.log(`減少: ${reduction}%`);
}

// 執行優化
optimizeCSS();