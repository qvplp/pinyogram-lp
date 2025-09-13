/**
 * ヒーロースライダーモジュール
 * パフォーマンス最適化とアクセシビリティ対応
 */

export class HeroSlider {
    constructor(options = {}) {
        this.slides = [];
        this.indicators = [];
        this.currentSlide = 0;
        this.autoSlideInterval = null;
        this.isInitialized = false;
        
        // 設定のデフォルト値
        this.config = {
            autoSlideDelay: options.autoSlideDelay || 5000,
            transitionDuration: options.transitionDuration || 300,
            pauseOnHover: options.pauseOnHover !== false,
            ...options
        };
    }

    /**
     * スライダーの初期化
     * @returns {boolean} 初期化の成功/失敗
     */
    initialize() {
        try {
            this.slides = Array.from(document.querySelectorAll('.hero-slide'));
            this.indicators = Array.from(document.querySelectorAll('.hero-indicator'));
            
            if (this.slides.length === 0) {
                // スライドが見つからない場合は警告を出さずにfalseを返す
                return false;
            }

            this.setupEventListeners();
            this.startAutoSlide();
            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('Hero slider initialization failed:', error);
            return false;
        }
    }

    /**
     * イベントリスナーの設定
     * @private
     */
    setupEventListeners() {
        // インジケータークリックイベント
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                this.goToSlide(index);
            });
            
            // アクセシビリティ対応
            indicator.setAttribute('role', 'button');
            indicator.setAttribute('aria-label', `スライド ${index + 1} に移動`);
            indicator.setAttribute('tabindex', '0');
        });

        // キーボードナビゲーション
        document.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft') {
                this.previousSlide();
            } else if (event.key === 'ArrowRight') {
                this.nextSlide();
            }
        });

        // ホバー時の自動スライド停止
        if (this.config.pauseOnHover) {
            const sliderContainer = document.querySelector('.hero-slider');
            if (sliderContainer) {
                sliderContainer.addEventListener('mouseenter', () => {
                    this.stopAutoSlide();
                });
                
                sliderContainer.addEventListener('mouseleave', () => {
                    this.startAutoSlide();
                });
            }
        }
    }

    /**
     * 指定されたスライドに移動
     * @param {number} index - スライドのインデックス
     */
    goToSlide(index) {
        if (index < 0 || index >= this.slides.length) {
            console.warn('Invalid slide index:', index);
            return;
        }

        this.currentSlide = index;
        this.updateSlider();
    }

    /**
     * 次のスライドに移動
     */
    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    }

    /**
     * 前のスライドに移動
     */
    previousSlide() {
        const prevIndex = this.currentSlide === 0 
            ? this.slides.length - 1 
            : this.currentSlide - 1;
        this.goToSlide(prevIndex);
    }

    /**
     * スライダーの更新
     * @private
     */
    updateSlider() {
        // スライドの更新
        this.slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === this.currentSlide);
            slide.setAttribute('aria-hidden', index !== this.currentSlide);
        });
        
        // インジケーターの更新
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
            indicator.setAttribute('aria-pressed', index === this.currentSlide);
        });

        // アクセシビリティ: 現在のスライドをスクリーンリーダーに通知
        const currentSlide = this.slides[this.currentSlide];
        if (currentSlide) {
            currentSlide.setAttribute('aria-live', 'polite');
        }
    }

    /**
     * 自動スライドの開始
     * @private
     */
    startAutoSlide() {
        this.stopAutoSlide(); // 既存のタイマーをクリア
        
        this.autoSlideInterval = setInterval(() => {
            this.nextSlide();
        }, this.config.autoSlideDelay);
    }

    /**
     * 自動スライドの停止
     * @private
     */
    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }

    /**
     * スライダーの破棄
     */
    destroy() {
        if (this.isInitialized) {
            this.stopAutoSlide();
            
            // イベントリスナーの削除
            this.indicators.forEach(indicator => {
                indicator.removeEventListener('click', this.goToSlide);
            });
            
            this.isInitialized = false;
        }
    }
}
