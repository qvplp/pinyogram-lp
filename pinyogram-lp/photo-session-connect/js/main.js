/**
 * ぴにょぐらむ撮影会 - メインJavaScript
 * 全ページ共通の機能を管理
 */

// ===================================
// グローバル設定
// ===================================
const APP_CONFIG = {
    name: 'ぴにょぐらむ撮影会',
    version: '1.0.0',
    api: {
        baseUrl: '/api', // 将来のAPI用
        timeout: 5000
    },
    storage: {
        prefix: 'psc_', // LocalStorage用プレフィックス
        expires: 86400000 // 24時間（ミリ秒）
    }
};

// ===================================
// ユーティリティ関数
// ===================================
const Utils = {
    /**
     * 要素を安全に取得
     */
    getElement(selector) {
        return document.querySelector(selector);
    },

    /**
     * 複数要素を取得
     */
    getElements(selector) {
        return document.querySelectorAll(selector);
    },

    /**
     * 日付フォーマット
     */
    formatDate(date, format = 'YYYY/MM/DD') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day);
    },

    /**
     * 価格フォーマット
     */
    formatPrice(price) {
        return `¥${price.toLocaleString()}`;
    },

    /**
     * LocalStorage操作
     */
    storage: {
        set(key, value, expires = APP_CONFIG.storage.expires) {
            const data = {
                value: value,
                expires: Date.now() + expires
            };
            localStorage.setItem(APP_CONFIG.storage.prefix + key, JSON.stringify(data));
        },

        get(key) {
            const item = localStorage.getItem(APP_CONFIG.storage.prefix + key);
            if (!item) return null;
            
            const data = JSON.parse(item);
            if (Date.now() > data.expires) {
                this.remove(key);
                return null;
            }
            return data.value;
        },

        remove(key) {
            localStorage.removeItem(APP_CONFIG.storage.prefix + key);
        },

        clear() {
            Object.keys(localStorage)
                .filter(key => key.startsWith(APP_CONFIG.storage.prefix))
                .forEach(key => localStorage.removeItem(key));
        }
    },

    /**
     * デバウンス処理
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// ===================================
// ヘッダー機能
// ===================================
class HeaderManager {
    constructor() {
        this.header = Utils.getElement('header');
        this.mobileMenuBtn = Utils.getElement('#mobileMenuBtn');
        this.navLinks = Utils.getElement('.nav-links');
        this.lastScrollTop = 0;
        
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupScrollBehavior();
        this.setActiveLink();
    }

    /**
     * モバイルメニューの設定
     */
    setupMobileMenu() {
        if (!this.mobileMenuBtn) return;

        this.mobileMenuBtn.addEventListener('click', () => {
            this.mobileMenuBtn.classList.toggle('active');
            this.navLinks.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        // メニュー外クリックで閉じる
        document.addEventListener('click', (e) => {
            if (!this.header.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
    }

    closeMobileMenu() {
        this.mobileMenuBtn?.classList.remove('active');
        this.navLinks?.classList.remove('active');
        document.body.classList.remove('menu-open');
    }

    /**
     * スクロール時のヘッダー表示制御
     */
    setupScrollBehavior() {
        let scrollTimer;
        
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimer);
            
            scrollTimer = setTimeout(() => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                if (scrollTop > this.lastScrollTop && scrollTop > 100) {
                    // 下スクロール時
                    this.header.style.transform = 'translateY(-100%)';
                } else {
                    // 上スクロール時
                    this.header.style.transform = 'translateY(0)';
                }
                
                this.lastScrollTop = scrollTop;
            }, 100);
        });
    }

    /**
     * 現在のページをアクティブ表示
     */
    setActiveLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        Utils.getElements('.nav-links a').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}

// ===================================
// スライダー機能
// ===================================
class SliderManager {
    constructor() {
        this.slider = Utils.getElement('.slider');
        if (!this.slider) return;

        this.slides = Utils.getElements('.slide');
        this.indicators = Utils.getElements('.indicator');
        this.currentSlide = 0;
        this.slideInterval = null;
        this.intervalTime = 5000; // 5秒

        this.init();
    }

    init() {
        this.setupIndicators();
        this.startAutoSlide();
        this.setupTouchEvents();
    }

    /**
     * スライド表示
     */
    showSlide(index) {
        // 範囲チェック
        if (index >= this.slides.length) index = 0;
        if (index < 0) index = this.slides.length - 1;

        // すべてのスライドを非表示
        this.slides.forEach(slide => slide.classList.remove('active'));
        this.indicators.forEach(indicator => indicator.classList.remove('active'));

        // 指定のスライドを表示
        this.slides[index].classList.add('active');
        if (this.indicators[index]) {
            this.indicators[index].classList.add('active');
        }

        this.currentSlide = index;
    }

    /**
     * 次のスライド
     */
    nextSlide() {
        this.showSlide(this.currentSlide + 1);
    }

    /**
     * 前のスライド
     */
    prevSlide() {
        this.showSlide(this.currentSlide - 1);
    }

    /**
     * 自動スライド
     */
    startAutoSlide() {
        this.slideInterval = setInterval(() => {
            this.nextSlide();
        }, this.intervalTime);
    }

    stopAutoSlide() {
        clearInterval(this.slideInterval);
    }

    /**
     * インジケーター設定
     */
    setupIndicators() {
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                this.stopAutoSlide();
                this.showSlide(index);
                this.startAutoSlide();
            });
        });
    }

    /**
     * タッチイベント対応
     */
    setupTouchEvents() {
        let touchStartX = 0;
        let touchEndX = 0;

        this.slider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        this.slider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        });
    }

    handleSwipe(startX, endX) {
        const threshold = 50;
        const diff = startX - endX;

        if (Math.abs(diff) > threshold) {
            this.stopAutoSlide();
            
            if (diff > 0) {
                // 左スワイプ
                this.nextSlide();
            } else {
                // 右スワイプ
                this.prevSlide();
            }
            
            this.startAutoSlide();
        }
    }
}

// ===================================
// カレンダー機能
// ===================================
class CalendarManager {
    constructor() {
        this.calendarGrid = Utils.getElement('#calendarGrid');
        if (!this.calendarGrid) return;

        this.currentDate = new Date();
        this.currentMonth = this.currentDate.getMonth();
        this.currentYear = this.currentDate.getFullYear();
        
        // サンプルイベントデータ
        this.events = {
            '2025-08-10': ['サマーフェスタ2025'],
            '2025-08-15': ['平日限定セッション'],
            '2025-08-18': ['アニメキャラクターフェス'],
            '2025-08-20': ['個人撮影会'],
            '2025-08-24': ['ビギナーズフォトセッション'],
            '2025-08-25': ['アイドルグループ合同撮影会']
        };

        this.init();
    }

    init() {
        this.renderCalendar();
        this.setupNavigation();
    }

    /**
     * カレンダー描画
     */
    renderCalendar() {
        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        
        let html = '';
        
        // 曜日ヘッダー
        const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
        weekdays.forEach(day => {
            html += `<div class="calendar-day-header">${day}</div>`;
        });
        
        // 空白セル
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="calendar-day empty"></div>';
        }
        
        // 日付セル
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasEvent = this.events[dateStr];
            const isToday = this.isToday(day);
            
            let classes = 'calendar-day';
            if (hasEvent) classes += ' has-event';
            if (isToday) classes += ' today';
            
            html += `
                <div class="${classes}" data-date="${dateStr}">
                    <span class="day-number">${day}</span>
                    ${hasEvent ? '<span class="event-dot"></span>' : ''}
                </div>
            `;
        }
        
        this.calendarGrid.innerHTML = html;
        
        // 月表示を更新
        const monthTitle = Utils.getElement('#currentMonth');
        if (monthTitle) {
            monthTitle.textContent = `${this.currentYear}年${this.currentMonth + 1}月`;
        }
        
        // イベントリスナー設定
        this.setupDayClickEvents();
    }

    /**
     * 今日かどうか判定
     */
    isToday(day) {
        const today = new Date();
        return day === today.getDate() &&
               this.currentMonth === today.getMonth() &&
               this.currentYear === today.getFullYear();
    }

    /**
     * ナビゲーション設定
     */
    setupNavigation() {
        const prevBtn = Utils.getElement('#prevMonth');
        const nextBtn = Utils.getElement('#nextMonth');
        
        prevBtn?.addEventListener('click', () => {
            this.currentMonth--;
            if (this.currentMonth < 0) {
                this.currentMonth = 11;
                this.currentYear--;
            }
            this.renderCalendar();
        });
        
        nextBtn?.addEventListener('click', () => {
            this.currentMonth++;
            if (this.currentMonth > 11) {
                this.currentMonth = 0;
                this.currentYear++;
            }
            this.renderCalendar();
        });
    }

    /**
     * 日付クリックイベント
     */
    setupDayClickEvents() {
        Utils.getElements('.calendar-day:not(.empty)').forEach(day => {
            day.addEventListener('click', function() {
                const date = this.dataset.date;
                // イベント一覧ページへ遷移（日付でフィルタ）
                window.location.href = `events.html?date=${date}`;
            });
        });
    }
}

// ===================================
// スムーススクロール
// ===================================
class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        // アンカーリンクのスムーススクロール
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    const headerHeight = 70;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// ===================================
// フォームバリデーション
// ===================================
class FormValidator {
    constructor(formSelector) {
        this.form = Utils.getElement(formSelector);
        if (!this.form) return;
        
        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => {
            if (!this.validateForm()) {
                e.preventDefault();
            }
        });

        // リアルタイムバリデーション
        this.setupRealtimeValidation();
    }

    validateForm() {
        let isValid = true;
        const requiredFields = this.form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        
        // 必須チェック
        if (field.hasAttribute('required') && !value) {
            this.showError(field, '必須項目です');
            isValid = false;
        }
        
        // メールアドレスチェック
        else if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                this.showError(field, '正しいメールアドレスを入力してください');
                isValid = false;
            }
        }
        
        // 電話番号チェック
        else if (field.type === 'tel' && value) {
            const telRegex = /^[0-9]{10,11}$/;
            if (!telRegex.test(value.replace(/-/g, ''))) {
                this.showError(field, '正しい電話番号を入力してください');
                isValid = false;
            }
        }
        
        if (isValid) {
            this.clearError(field);
        }
        
        return isValid;
    }

    showError(field, message) {
        field.classList.add('error');
        
        let errorElement = field.parentElement.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = 'error-message';
            field.parentElement.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }

    clearError(field) {
        field.classList.remove('error');
        const errorElement = field.parentElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }

    setupRealtimeValidation() {
        const fields = this.form.querySelectorAll('input, textarea, select');
        
        fields.forEach(field => {
            field.addEventListener('blur', () => {
                this.validateField(field);
            });
            
            field.addEventListener('input', Utils.debounce(() => {
                if (field.classList.contains('error')) {
                    this.validateField(field);
                }
            }, 500));
        });
    }
}

// ===================================
// アプリケーション初期化
// ===================================
class PhotoSessionApp {
    constructor() {
        this.managers = {};
        this.init();
    }

    init() {
        // DOMContentLoaded を待つ
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        // 各コンポーネントの初期化
        this.managers.header = new HeaderManager();
        this.managers.slider = new SliderManager();
        this.managers.calendar = new CalendarManager();
        this.managers.smoothScroll = new SmoothScroll();
        
        // フォームがあれば初期化
        if (Utils.getElement('form')) {
            this.managers.formValidator = new FormValidator('form');
        }
        
        // ページ固有の初期化
        this.initPageSpecific();
        
        console.log('ぴにょぐらむ撮影会 initialized');
    }

    initPageSpecific() {
        // 現在のページを判定
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        switch(currentPage) {
            case 'index.html':
            case '':
                this.initHomePage();
                break;
            case 'events.html':
                // events.js で処理
                break;
            case 'event-detail.html':
                this.initEventDetailPage();
                break;
            case 'reservation.html':
                // reservation.js で処理
                break;
        }
    }

    initHomePage() {
        // ホームページ固有の処理
        this.setupEventCards();
    }

    initEventDetailPage() {
        // イベント詳細ページの処理
        this.loadEventDetail();
    }

    setupEventCards() {
        // イベントカードのホバーエフェクト強化
        Utils.getElements('.event-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    }

    loadEventDetail() {
        // URLパラメータからイベントIDを取得
        const urlParams = new URLSearchParams(window.location.search);
        const eventId = urlParams.get('id');
        
        if (eventId) {
            // 実際にはAPIから取得
            console.log('Loading event:', eventId);
            // ここでイベント詳細を読み込む処理
        }
    }
}

// ===================================
// グローバルインスタンス作成
// ===================================
const app = new PhotoSessionApp();

// グローバルに公開（必要に応じて）
window.PhotoSessionApp = app;
window.Utils = Utils;
