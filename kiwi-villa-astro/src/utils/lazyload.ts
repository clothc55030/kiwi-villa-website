/**
 * 圖片懶加載工具
 * 使用 Intersection Observer API 實現高性能的圖片懶加載
 */

export function initLazyLoad() {
  // 檢查瀏覽器支援
  if (!('IntersectionObserver' in window)) {
    // 降級處理：直接載入所有圖片
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      const imgElement = img as HTMLImageElement;
      if (imgElement.dataset.src) {
        imgElement.src = imgElement.dataset.src;
        imgElement.removeAttribute('data-src');
      }
    });
    return;
  }

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        
        // 添加載入中的樣式
        img.classList.add('lazy-img');
        
        // 創建新圖片以預載入
        const tempImg = new Image();
        tempImg.onload = () => {
          // 圖片載入成功
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.add('loaded');
            img.removeAttribute('data-src');
            
            // 如果有 srcset，也更新它
            if (img.dataset.srcset) {
              img.srcset = img.dataset.srcset;
              img.removeAttribute('data-srcset');
            }
          }
        };
        
        // 開始載入圖片
        if (img.dataset.src) {
          tempImg.src = img.dataset.src;
        }
        
        // 停止觀察此圖片
        imageObserver.unobserve(img);
      }
    });
  }, {
    // 提前 50px 開始載入
    rootMargin: '50px 0px',
    threshold: 0.01
  });

  // 觀察所有懶加載圖片
  const lazyImages = document.querySelectorAll('img[data-src]');
  lazyImages.forEach(img => {
    // 添加占位符樣式
    img.classList.add('lazy-img', 'img-placeholder');
    imageObserver.observe(img);
  });

  // 處理 picture 元素中的 source
  const lazySources = document.querySelectorAll('source[data-srcset]');
  lazySources.forEach(source => {
    const sourceElement = source as HTMLSourceElement;
    const picture = sourceElement.closest('picture');
    if (picture) {
      const img = picture.querySelector('img');
      if (img) {
        // 當圖片進入視窗時，同時更新 source
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && sourceElement.dataset.srcset) {
              sourceElement.srcset = sourceElement.dataset.srcset;
              sourceElement.removeAttribute('data-srcset');
              observer.unobserve(entry.target);
            }
          });
        }, {
          rootMargin: '50px 0px',
          threshold: 0.01
        });
        observer.observe(img);
      }
    }
  });
}