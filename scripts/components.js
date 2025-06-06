/**
 * 期遇度假會館 - 通用組件
 * 統一管理網站共用組件，確保一致性
 */

// 聯絡資訊組件
class ContactInfoComponent {
    constructor() {
        this.contactData = {
            contact: {
                line: '@kiwivilla',
                wechat: 'rickywang4159',
                phone: '0933636373',
                email: 'info@kiwi-villa.com'
            },
            address: {
                chinese: '台灣澎湖縣馬公市西衛里 346-347號',
                english: 'NO.346-347, Xiwei Village, Magong City, Penghu County, Taiwan',
                googleMaps: 'https://www.google.com.tw/maps/place/%E6%9C%9F%E9%81%87%E5%BA%A6%E5%81%87%E6%9C%83%E9%A4%A8/@23.5835134,119.5842094,15.75z/data=!4m5!3m4!1s0x0:0x2157a9c94466e69b!8m2!3d23.5868865!4d119.5818231'
            },
            social: {
                instagram: 'https://www.instagram.com/kiwi_villa/',
                facebook: 'https://www.facebook.com/kiwivilla.home/',
                line: 'https://page.line.me/ucz4004x'
            }
        };
    }

    // 生成聯絡資訊HTML
    generateHTML() {
        return `
            <section class="contact-info">
                <div class="container">
                    <div class="contact-grid">
                        <div class="contact-item">
                            <h3>聯絡我們</h3>
                            <p><a href="${this.contactData.social.line}" target="_blank" class="contact-link"><i class="fab fa-line"></i> Line: ${this.contactData.contact.line}</a></p>
                            <p><i class="fab fa-weixin"></i> WeChat ID: ${this.contactData.contact.wechat}</p>
                            <p><a href="tel:${this.contactData.contact.phone}" class="contact-link"><i class="fas fa-phone"></i> 訂房熱線：${this.contactData.contact.phone}</a></p>
                            <p><a href="mailto:${this.contactData.contact.email}" class="contact-link"><i class="fas fa-envelope"></i> ${this.contactData.contact.email}</a></p>
                        </div>
                        <div class="contact-item">
                            <h3>地址</h3>
                            <p><a href="${this.contactData.address.googleMaps}" target="_blank" style="color: inherit; text-decoration: none;"><i class="fas fa-map-marker-alt"></i> ${this.contactData.address.chinese}</a></p>
                            <p><a href="${this.contactData.address.googleMaps}" target="_blank" style="color: inherit; text-decoration: none;">${this.contactData.address.english}</a></p>
                        </div>
                        <div class="contact-item">
                            <h3>追蹤我們</h3>
                            <div class="social-links">
                                <a href="${this.contactData.social.instagram}" class="social-link" target="_blank"><i class="fab fa-instagram"></i></a>
                                <a href="${this.contactData.social.facebook}" class="social-link" target="_blank"><i class="fab fa-facebook-f"></i></a>
                                <a href="${this.contactData.social.line}" class="social-link" target="_blank"><i class="fab fa-line"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    // 渲染聯絡資訊到指定元素
    render(containerId = 'contact-info-container') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = this.generateHTML();
        } else {
            console.warn(`找不到容器 #${containerId}`);
        }
    }

    // 自動渲染到頁面（在footer前插入）
    autoRender() {
        const footer = document.querySelector('footer');
        if (footer) {
            const contactSection = document.createElement('div');
            contactSection.innerHTML = this.generateHTML();
            footer.parentNode.insertBefore(contactSection.firstElementChild, footer);
        }
    }
}

// Footer組件
class FooterComponent {
    constructor() {
        this.footerData = {
            copyright: '&copy; 2025 澎湖期遇度假會館 Kiwi Villa | By Ricky Wang'
        };
    }

    generateHTML() {
        return `
            <footer class="footer">
                <div class="container">
                    <div class="footer-content">
                        <p>${this.footerData.copyright}</p>
                    </div>
                </div>
            </footer>
        `;
    }

    render(containerId = 'footer-container') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = this.generateHTML();
        }
    }

    autoRender() {
        const existingFooter = document.querySelector('footer');
        if (existingFooter) {
            existingFooter.outerHTML = this.generateHTML();
        } else {
            document.body.insertAdjacentHTML('beforeend', this.generateHTML());
        }
    }
}

// 頁面載入完成後自動初始化組件
document.addEventListener('DOMContentLoaded', function() {
    // 檢查是否需要自動載入聯絡資訊
    if (document.querySelector('.contact-info') || document.getElementById('contact-info-container')) {
        const contactInfo = new ContactInfoComponent();
        
        // 如果頁面已有聯絡資訊區塊，替換它
        const existingContactInfo = document.querySelector('.contact-info');
        if (existingContactInfo) {
            existingContactInfo.outerHTML = contactInfo.generateHTML();
        } else {
            // 否則自動渲染
            contactInfo.autoRender();
        }
    }
});

// 暴露組件給全域使用
window.ContactInfoComponent = ContactInfoComponent;
window.FooterComponent = FooterComponent; 