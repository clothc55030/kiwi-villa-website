# SSL憑證設定指南 - 期遇度假會館

## 🔒 **SSL憑證獲取方式**

### **選項一：免費憑證 (推薦新手)**

#### **Let's Encrypt (完全免費)**
```bash
# 使用Certbot自動獲取憑證
sudo apt update
sudo apt install certbot python3-certbot-apache

# 為域名獲取憑證
sudo certbot --apache -d www.kiwi-villa.com -d kiwi-villa.com

# 自動續約設定
sudo crontab -e
# 添加以下行：
0 12 * * * /usr/bin/certbot renew --quiet
```

#### **Cloudflare (免費+CDN加速)**
1. 註冊Cloudflare帳號
2. 添加您的域名
3. 更改DNS伺服器到Cloudflare
4. 在SSL/TLS設定中選擇"完整"模式
5. 啟用"始終使用HTTPS"

### **選項二：付費憑證 (推薦商業用途)**

#### **主流SSL憑證商**
- **DigiCert** - 業界標準，信任度最高
- **Sectigo (原Comodo)** - 性價比高
- **GoDaddy** - 易於管理
- **RapidSSL** - 基礎憑證，價格便宜

#### **憑證類型選擇**
- **DV (Domain Validation)** - 最基礎，僅驗證域名
- **OV (Organization Validation)** - 驗證組織資訊
- **EV (Extended Validation)** - 最高級，綠色地址欄

### **選項三：主機商提供**

#### **常見主機商SSL方案**
- **cPanel主機** - 通常提供免費Let's Encrypt
- **WordPress主機** - 多數包含免費SSL
- **雲端主機** - AWS/Google Cloud/Azure都有SSL服務

## 🛠️ **技術實施步驟**

### **步驟1：安裝憑證到伺服器**

#### **Apache伺服器配置**
```apache
# /etc/apache2/sites-available/kiwi-villa.conf
<VirtualHost *:443>
    ServerName kiwi-villa.com
    ServerAlias www.kiwi-villa.com
    DocumentRoot /var/www/kiwi-villa
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    SSLCertificateChainFile /path/to/chain.crt
    
    # Modern SSL Configuration
    SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1
    SSLCipherSuite ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256
    SSLHonorCipherOrder off
    SSLSessionTickets off
</VirtualHost>

# HTTP to HTTPS Redirect
<VirtualHost *:80>
    ServerName kiwi-villa.com
    ServerAlias www.kiwi-villa.com
    Redirect permanent / https://kiwi-villa.com/
</VirtualHost>
```

#### **Nginx伺服器配置**
```nginx
# /etc/nginx/sites-available/kiwi-villa
server {
    listen 443 ssl http2;
    server_name kiwi-villa.com www.kiwi-villa.com;
    root /var/www/kiwi-villa;
    
    # SSL Configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_trusted_certificate /path/to/chain.crt;
    
    # Modern SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
}

# HTTP to HTTPS Redirect
server {
    listen 80;
    server_name kiwi-villa.com www.kiwi-villa.com;
    return 301 https://kiwi-villa.com$request_uri;
}
```

### **步驟2：更新.htaccess (Apache用戶)**
```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# HSTS Security Header
Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
```

### **步驟3：測試憑證安裝**

#### **線上測試工具**
- **SSL Labs Test**: https://www.ssllabs.com/ssltest/
- **SSL Checker**: https://www.sslshopper.com/ssl-checker.html
- **SecurityHeaders**: https://securityheaders.com/

#### **命令行測試**
```bash
# 測試SSL握手
openssl s_client -connect kiwi-villa.com:443 -servername kiwi-villa.com

# 檢查憑證詳情
openssl x509 -in certificate.crt -text -noout
```

## 🔧 **實施後檢查清單**

### **✅ 技術檢查**
- [ ] HTTPS正常載入
- [ ] HTTP自動重導向到HTTPS
- [ ] 綠色鎖頭圖標顯示
- [ ] SSL Labs評級A或A+
- [ ] 所有資源都透過HTTPS載入

### **✅ SEO更新**
- [ ] Google Search Console添加HTTPS版本
- [ ] 更新sitemap.xml中的URLs
- [ ] 更新所有canonical URLs
- [ ] 檢查並修復混合內容警告

### **✅ 行銷更新**  
- [ ] 更新所有行銷材料中的網址
- [ ] 更新社群媒體檔案中的網址
- [ ] 通知合作夥伴網址變更

## 💰 **成本預估**

### **免費選項**
- **Let's Encrypt**: $0/年
- **Cloudflare**: $0/年 (基礎版)

### **付費選項**
- **DV憑證**: $10-50/年
- **OV憑證**: $50-200/年  
- **EV憑證**: $200-1000/年
- **萬用字元憑證**: $100-500/年

## 📞 **技術支援**

### **常見問題解決**
1. **混合內容錯誤** - 檢查所有HTTP資源
2. **憑證鏈問題** - 確保包含中間憑證
3. **重導向循環** - 檢查.htaccess或伺服器配置
4. **效能影響** - 啟用HTTP/2和SSL會話復用

### **專業服務推薦**
如果自行設定有困難，建議尋求：
- 主機商技術支援
- 網站開發公司協助
- SSL憑證商客服支援

---
**重要提醒**: SSL憑證安裝涉及伺服器配置，建議在操作前先備份網站，並在低流量時段進行。 