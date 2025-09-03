/**
 * ぴにょぐらむ撮影会 - メインアプリケーション
 * モジュラー設計、パフォーマンス最適化、セキュリティ強化
 */

// モジュールのインポート（ES6 modules対応）
import { NavigationManager } from './modules/navigation.js';
import { HeroSlider } from './modules/heroSlider.js';
import { PerformanceManager } from './modules/performance.js';
import { SecurityManager } from './modules/security.js';

/**
 * メインアプリケーションクラス
 * アーキテクチャの中心となる統合管理クラス
 */
class PinyogramApp {
    constructor() {
        this.modules = {
            navigation: null,
            heroSlider: null,
            performance: null,
            security: null
        };
        
        this.isInitialized = false;
        this.config = {
            debug: false,
            performanceMonitoring: true,
            securityAudit: true
        };
    }

    /**
     * アプリケーションの初期化
     * @returns {Promise<boolean>} 初期化の成功/失敗
     */
    async initialize() {
        try {
            console.log('🚀 Pinyogram App initializing...');
            
            // セキュリティマネージャーの初期化
            await this.initializeSecurity();
            
            // パフォーマンスマネージャーの初期化
            await this.initializePerformance();
            
            // ナビゲーションマネージャーの初期化
            await this.initializeNavigation();
            
            // ヒーロースライダーの初期化
            await this.initializeHeroSlider();
            
            // グローバルエラーハンドリングの設定
            this.setupGlobalErrorHandling();
            
            // パフォーマンス監視の開始
            if (this.config.performanceMonitoring) {
                this.startPerformanceMonitoring();
            }
            
            this.isInitialized = true;
            console.log('✅ Pinyogram App initialized successfully');
            return true;
            
        } catch (error) {
            console.error('❌ App initialization failed:', error);
            return false;
        }
    }

    /**
     * セキュリティマネージャーの初期化
     * @private
     */
    async initializeSecurity() {
        this.modules.security = new SecurityManager();
        this.modules.security.setSecurityHeaders();
        
        if (this.config.securityAudit) {
            const audit = this.modules.security.performSecurityAudit();
            if (audit.vulnerabilities.length > 0) {
                console.warn('Security vulnerabilities detected:', audit.vulnerabilities);
            }
        }
    }

    /**
     * パフォーマンスマネージャーの初期化
     * @private
     */
    async initializePerformance() {
        this.modules.performance = new PerformanceManager();
        
        // パフォーマンスメトリクスの測定
        this.modules.performance.measurePerformance('app-initialization', () => {
            // 初期化処理の測定
        });
    }

    /**
     * ナビゲーションマネージャーの初期化
     * @private
     */
    async initializeNavigation() {
        this.modules.navigation = new NavigationManager();
        const success = this.modules.navigation.initialize();
        
        if (!success) {
            console.warn('Navigation initialization failed');
        }
    }

    /**
     * ヒーロースライダーの初期化
     * @private
     */
    async initializeHeroSlider() {
        this.modules.heroSlider = new HeroSlider({
            autoSlideDelay: 5000,
            pauseOnHover: true
        });
        
        const success = this.modules.heroSlider.initialize();
        
        if (!success) {
            console.warn('Hero slider initialization failed');
        }
    }

    /**
     * グローバルエラーハンドリングの設定
     * @private
     */
    setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('JavaScript Error:', event.error);
            
            // エラー追跡サービスへの送信（本番環境）
            if (!this.config.debug) {
                this.trackError(event.error);
            }
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled Promise Rejection:', event.reason);
            event.preventDefault();
            
            // エラー追跡サービスへの送信（本番環境）
            if (!this.config.debug) {
                this.trackError(event.reason);
            }
        });
    }

    /**
     * パフォーマンス監視の開始
     * @private
     */
    startPerformanceMonitoring() {
        // ページ読み込み時間の測定
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            console.log(`Page load time: ${loadTime.toFixed(2)}ms`);
            
            // メモリ使用量の監視
            const memoryUsage = this.modules.performance.getMemoryUsage();
            if (memoryUsage) {
                console.log('Memory usage:', memoryUsage);
            }
        });
        
        // 定期的なパフォーマンスレポート
        setInterval(() => {
            const report = this.modules.performance.generateReport();
            if (this.config.debug) {
                console.log('Performance Report:', report);
            }
        }, 30000); // 30秒ごと
    }

    /**
     * エラーの追跡
     * @param {Error} error - 追跡するエラー
     * @private
     */
    trackError(error) {
        // 本番環境ではエラー追跡サービスに送信
        const errorData = {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        // 例: Sentry、LogRocket等への送信
        console.log('Error tracked:', errorData);
    }

    /**
     * アプリケーションの破棄
     */
    destroy() {
        if (this.isInitialized) {
            // 各モジュールの破棄
            Object.values(this.modules).forEach(module => {
                if (module && typeof module.destroy === 'function') {
                    module.destroy();
                }
            });
            
            this.isInitialized = false;
            console.log('Pinyogram App destroyed');
        }
    }
}

// アプリケーションのインスタンス化と初期化
const app = new PinyogramApp();

// DOM読み込み完了後にアプリケーションを初期化
document.addEventListener('DOMContentLoaded', async () => {
    await app.initialize();
});

// ページ離脱時のクリーンアップ
window.addEventListener('beforeunload', () => {
    app.destroy();
});

// ナビゲーション機能の初期化
function initializeNavigation() {
    const mobileMenuToggle = getElement('#mobileMenuToggle');
    const navLinks = getElement('#navLinks');
    
    if (mobileMenuToggle && navLinks) {
        // ハンバーガーメニューの制御
        mobileMenuToggle.addEventListener('click', () => {
            const isExpanded = navLinks.classList.contains('active');
            mobileMenuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            
            // アクセシビリティ属性の更新
            mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
            mobileMenuToggle.setAttribute('aria-label', !isExpanded ? 'メニューを閉じる' : 'メニューを開く');
        });
        
        // メニュー外クリックで閉じる
        document.addEventListener('click', (e) => {
            if (!e.target.closest('nav')) {
                mobileMenuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                mobileMenuToggle.setAttribute('aria-label', 'メニューを開く');
            }
        });
        
        // ESCキーでメニューを閉じる
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && navLinks.classList.contains('active')) {
                mobileMenuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                mobileMenuToggle.setAttribute('aria-label', 'メニューを開く');
                mobileMenuToggle.focus();
            }
        });
    }
}

// ヒーロースライダー機能の初期化
function initializeHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const indicators = document.querySelectorAll('.hero-indicator');
    let currentSlide = 0;
    
    if (slides.length === 0) return;
    
    // スライダーの自動再生
    const autoSlide = () => {
        currentSlide = (currentSlide + 1) % slides.length;
        updateSlider();
    };
    
    // スライダーの更新
    const updateSlider = () => {
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === currentSlide);
        });
        
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentSlide);
        });
    };
    
    // インジケータークリックイベント
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentSlide = index;
            updateSlider();
        });
    });
    
    // 自動スライド開始（5秒間隔）
    setInterval(autoSlide, 5000);
}

// スクロール効果の初期化
function initializeScrollEffects() {
    const header = getElement('header');
    
    if (header) {
        // ヘッダーのスクロール効果（パフォーマンス最適化）
        const handleScroll = debounce(() => {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }, 10);
        
        window.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    // アニメーション用のIntersection Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // アニメーション対象要素の監視
    const animateElements = document.querySelectorAll('.event-card, .feature-card, .section');
    animateElements.forEach(el => {
        observer.observe(el);
    });
}

// パフォーマンス監視
if ('PerformanceObserver' in window) {
    const performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
                console.log('Page Load Time:', entry.loadEventEnd - entry.loadEventStart, 'ms');
            }
        }
    });
    
    performanceObserver.observe({ entryTypes: ['navigation'] });
}

console.log('ぴにょぐらむ撮影会サイトが読み込まれました！📸');
