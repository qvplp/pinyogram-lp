// ===================================
// イベントカード画像管理システム（修正版）
// ===================================

class EventCardImageManager {
    constructor() {
        this.defaultImages = {
            'individual': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"%3E%3Cdefs%3E%3ClinearGradient id="g1" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%2310b981"/%3E%3Cstop offset="100%25" style="stop-color:%233b82f6"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="200" fill="url(%23g1)"/%3E%3Ctext x="200" y="100" text-anchor="middle" fill="white" font-size="18" font-family="system-ui"%3E個人撮影会%3C/text%3E%3C/svg%3E',
            'group': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"%3E%3Cdefs%3E%3ClinearGradient id="g2" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23ff6ec7"/%3E%3Cstop offset="100%25" style="stop-color:%233b82f6"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="200" fill="url(%23g2)"/%3E%3Ctext x="200" y="100" text-anchor="middle" fill="white" font-size="18" font-family="system-ui"%3Eグループ撮影会%3C/text%3E%3C/svg%3E'
        };
        
        this.init();
    }
    
    init() {
        console.log('EventCardImageManager 初期化開始');
        
        // DOMが完全に読み込まれているか確認
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupImageManagement();
            });
        } else {
            this.setupImageManagement();
        }
    }
    
    setupImageManagement() {
        // 遅延読み込みの設定
        this.setupLazyLoading();
        
        // 画像エラーハンドリング
        this.setupErrorHandling();
        
        // 画像プリロード
        this.preloadImages();
    }
    
    // 遅延読み込み
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const imageContainer = entry.target;
                        const img = imageContainer.querySelector('img');
                        
                        if (img && img.dataset.src) {
                            this.loadImage(img, img.dataset.src);
                            observer.unobserve(imageContainer);
                        }
                    }
                });
            }, {
                rootMargin: '50px'
            });
            
            // 要素が存在するか確認してから観察
            const lazyContainers = document.querySelectorAll('.event-card-image[data-lazy="true"]');
            if (lazyContainers.length > 0) {
                lazyContainers.forEach(container => {
                    imageObserver.observe(container);
                });
            }
        }
    }
    
    // 画像読み込み
    loadImage(img, src) {
        if (!img || !src) return;
        
        const tempImg = new Image();
        
        tempImg.onload = () => {
            img.src = src;
            img.classList.add('fade-in');
            
            // 親要素が存在するか確認
            if (img.parentElement) {
                img.parentElement.classList.add('loaded');
                img.parentElement.classList.remove('skeleton');
            }
        };
        
        tempImg.onerror = () => {
            this.handleImageError(img);
        };
        
        tempImg.src = src;
    }
    
    // エラーハンドリング
    setupErrorHandling() {
        const images = document.querySelectorAll('.event-card-image img');
        if (images.length > 0) {
            images.forEach(img => {
                img.addEventListener('error', () => {
                    this.handleImageError(img);
                });
            });
        }
    }
    
    // 画像エラー時の処理
    handleImageError(img) {
        if (!img) return;
        
        const card = img.closest('.event-card');
        if (!card) return;
        
        const eventType = card.classList.contains('individual') ? 'individual' : 'group';
        const titleElement = card.querySelector('.event-title, .event-card-title');
        const eventTitle = titleElement ? titleElement.textContent : 'イベント';
        
        // カスタムSVGフォールバック画像を生成
        const fallbackSVG = this.generateFallbackSVG(eventTitle, eventType);
        img.src = fallbackSVG;
        
        // エラークラスを追加
        if (img.parentElement) {
            img.parentElement.classList.add('image-error');
        }
    }
    
    // フォールバックSVG生成
    generateFallbackSVG(title, type) {
        const colors = type === 'individual' 
            ? ['%2310b981', '%233b82f6'] 
            : ['%23ff6ec7', '%233b82f6'];
        
        // タイトルを短縮（長すぎる場合）
        const displayTitle = title.length > 15 ? title.substring(0, 12) + '...' : title;
        
        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 200'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:${colors[0]}'/%3E%3Cstop offset='100%25' style='stop-color:${colors[1]}'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='200' fill='url(%23grad)'/%3E%3Ctext x='200' y='100' text-anchor='middle' fill='white' font-size='16' font-family='system-ui'%3E${encodeURIComponent(displayTitle)}%3C/text%3E%3C/svg%3E`;
    }
    
    // 画像のプリロード
    preloadImages() {
        const imagesToPreload = [];
        const images = document.querySelectorAll('.event-card-image img');
        
        // 最初の3枚の画像をプリロード
        images.forEach((img, index) => {
            if (index < 3 && img.src && !img.src.startsWith('data:')) {
                imagesToPreload.push(img.src);
            }
        });
        
        imagesToPreload.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }
    
    // 画像URLを動的に設定（エラーチェック付き）
    setEventImage(eventId, imageUrl, options = {}) {
        // 要素の存在を確認
        const card = document.querySelector(`[data-event-id="${eventId}"]`);
        if (!card) {
            console.warn(`Event card with ID ${eventId} not found`);
            return false;
        }
        
        const imageContainer = card.querySelector('.event-card-image');
        if (!imageContainer) {
            console.warn(`Image container not found in card ${eventId}`);
            return false;
        }
        
        const img = imageContainer.querySelector('img');
        if (!img) {
            console.warn(`Image element not found in card ${eventId}`);
            return false;
        }
        
        // オプション設定
        if (options.aspectRatio) {
            imageContainer.className = `event-card-image banner-${options.aspectRatio}`;
        }
        
        if (options.focusPoint) {
            img.className = `focus-${options.focusPoint}`;
        }
        
        if (options.overlay) {
            imageContainer.classList.add('with-overlay');
        }
        
        // 画像を設定
        this.loadImage(img, imageUrl);
        return true;
    }
    
    // バッチ画像更新（エラーチェック付き）
    updateMultipleImages(imageData) {
        if (!Array.isArray(imageData)) {
            console.error('imageData must be an array');
            return;
        }
        
        let successCount = 0;
        let failCount = 0;
        
        imageData.forEach(data => {
            if (data.eventId && data.imageUrl) {
                const result = this.setEventImage(data.eventId, data.imageUrl, data.options || {});
                if (result) {
                    successCount++;
                } else {
                    failCount++;
                }
            } else {
                console.warn('Invalid image data:', data);
                failCount++;
            }
        });
        
        console.log(`Image update complete: ${successCount} success, ${failCount} failed`);
    }
}

// 画像データ管理（サンプル）
const eventImageData = {
    'EVT001': {
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=250&fit=crop',
        alt: 'サマーフェスタ2024',
        options: {
            aspectRatio: '16-9',
            focusPoint: 'center'
        }
    },
    'EVT002': {
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=250&fit=crop',
        alt: '田中愛理 個人撮影会',
        options: {
            aspectRatio: '16-9',
            focusPoint: 'face'
        }
    },
    'EVT003': {
        url: 'https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?w=400&h=250&fit=crop',
        alt: 'コスプレ撮影会SP',
        options: {
            aspectRatio: '16-9',
            focusPoint: 'center'
        }
    },
    'EVT004': {
        url: 'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?w=400&h=250&fit=crop',
        alt: '山田花子 撮影会',
        options: {
            aspectRatio: '16-9',
            focusPoint: 'face'
        }
    },
    'EVT005': {
        url: 'https://images.unsplash.com/photo-1490889573446-3cc8aa38647e?w=400&h=250&fit=crop',
        alt: '真夏の浴衣撮影会',
        options: {
            aspectRatio: '16-9',
            focusPoint: 'center'
        }
    },
    'EVT006': {
        url: 'https://images.unsplash.com/photo-1502781252888-9143ba7f074e?w=400&h=250&fit=crop',
        alt: '佐藤美咲 個人撮影',
        options: {
            aspectRatio: '16-9',
            focusPoint: 'face'
        }
    }
};

// 初期化（DOMContentLoadedで実行）
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM読み込み完了 - イベント画像管理開始');
    
    // イベントカードが存在するか確認
    const eventCards = document.querySelectorAll('.event-card');
    if (eventCards.length === 0) {
        console.warn('No event cards found on the page');
        return;
    }
    
    // 画像管理システムの初期化
    const imageManager = new EventCardImageManager();
    
    // 画像データを適用（存在するカードのみ）
    const imageUpdateData = [];
    Object.entries(eventImageData).forEach(([eventId, data]) => {
        // カードが存在するか確認
        if (document.querySelector(`[data-event-id="${eventId}"]`)) {
            imageUpdateData.push({
                eventId: eventId,
                imageUrl: data.url,
                options: data.options
            });
        }
    });
    
    // 画像を更新
    if (imageUpdateData.length > 0) {
        console.log(`Updating ${imageUpdateData.length} event images`);
        imageManager.updateMultipleImages(imageUpdateData);
    } else {
        console.log('No matching event cards found for image update');
    }
    
    // グローバルに公開（デバッグ用）
    window.eventImageManager = imageManager;
});