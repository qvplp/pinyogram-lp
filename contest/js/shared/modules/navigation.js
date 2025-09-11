/**
 * ナビゲーションモジュール
 * モジュラー設計による分離と再利用性の向上
 */

export class NavigationManager {
    constructor() {
        this.mobileMenuToggle = null;
        this.navLinks = null;
        this.isInitialized = false;
    }

    /**
     * ナビゲーション機能の初期化
     * @returns {boolean} 初期化の成功/失敗
     */
    initialize() {
        try {
            this.mobileMenuToggle = document.getElementById('mobileMenuToggle');
            this.navLinks = document.getElementById('navLinks');
            
            if (!this.mobileMenuToggle || !this.navLinks) {
                console.warn('Navigation elements not found');
                return false;
            }

            this.setupEventListeners();
            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('Navigation initialization failed:', error);
            return false;
        }
    }

    /**
     * イベントリスナーの設定
     * @private
     */
    setupEventListeners() {
        // ハンバーガーメニューの制御
        this.mobileMenuToggle.addEventListener('click', () => {
            this.toggleMobileMenu();
        });
        
        // メニュー外クリックで閉じる
        document.addEventListener('click', (e) => {
            if (!e.target.closest('nav')) {
                this.closeMobileMenu();
            }
        });
        
        // ESCキーでメニューを閉じる
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.isMenuOpen()) {
                this.closeMobileMenu();
            }
        });
    }

    /**
     * モバイルメニューの切り替え
     * @private
     */
    toggleMobileMenu() {
        const isExpanded = this.navLinks.classList.contains('active');
        
        this.mobileMenuToggle.classList.toggle('active');
        this.navLinks.classList.toggle('active');
        
        // アクセシビリティ属性の更新
        this.mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
        this.mobileMenuToggle.setAttribute('aria-label', 
            !isExpanded ? 'メニューを閉じる' : 'メニューを開く');
        
        // フォーカス管理
        if (!isExpanded) {
            const firstMenuItem = this.navLinks.querySelector('a');
            if (firstMenuItem) {
                firstMenuItem.focus();
            }
        }
    }

    /**
     * モバイルメニューを閉じる
     * @private
     */
    closeMobileMenu() {
        this.mobileMenuToggle.classList.remove('active');
        this.navLinks.classList.remove('active');
        this.mobileMenuToggle.setAttribute('aria-expanded', 'false');
        this.mobileMenuToggle.setAttribute('aria-label', 'メニューを開く');
    }

    /**
     * メニューが開いているかどうかを確認
     * @returns {boolean} メニューの開閉状態
     * @private
     */
    isMenuOpen() {
        return this.navLinks.classList.contains('active');
    }

    /**
     * ナビゲーションの破棄
     */
    destroy() {
        if (this.isInitialized) {
            // イベントリスナーの削除
            this.mobileMenuToggle.removeEventListener('click', this.toggleMobileMenu);
            this.isInitialized = false;
        }
    }
}
