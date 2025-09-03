/**
 * パフォーマンス最適化モジュール
 * 計算複雑度の最適化とキャッシュ戦略の実装
 */

export class PerformanceManager {
    constructor() {
        this.cache = new Map();
        this.observers = new Map();
        this.metrics = {
            loadTime: 0,
            renderTime: 0,
            interactionTime: 0
        };
    }

    /**
     * デバウンス関数の実装
     * @param {Function} func - 実行する関数
     * @param {number} wait - 待機時間（ミリ秒）
     * @param {boolean} immediate - 即座に実行するかどうか
     * @returns {Function} デバウンスされた関数
     */
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            
            if (callNow) func.apply(this, args);
        };
    }

    /**
     * スロットル関数の実装
     * @param {Function} func - 実行する関数
     * @param {number} limit - 制限時間（ミリ秒）
     * @returns {Function} スロットルされた関数
     */
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * キャッシュ機能付き関数の作成
     * @param {Function} fn - キャッシュする関数
     * @param {Function} keyGenerator - キャッシュキー生成関数
     * @returns {Function} キャッシュ機能付き関数
     */
    memoize(fn, keyGenerator = (...args) => JSON.stringify(args)) {
        return (...args) => {
            const key = keyGenerator(...args);
            
            if (this.cache.has(key)) {
                return this.cache.get(key);
            }
            
            const result = fn.apply(this, args);
            this.cache.set(key, result);
            return result;
        };
    }

    /**
     * Intersection Observer の最適化された実装
     * @param {string} selector - 監視する要素のセレクター
     * @param {Function} callback - コールバック関数
     * @param {Object} options - Observer オプション
     */
    createOptimizedObserver(selector, callback, options = {}) {
        const defaultOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px',
            ...options
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    callback(entry);
                    // 一度実行されたら監視を停止（パフォーマンス最適化）
                    observer.unobserve(entry.target);
                }
            });
        }, defaultOptions);

        const elements = document.querySelectorAll(selector);
        elements.forEach(element => observer.observe(element));

        this.observers.set(selector, observer);
        return observer;
    }

    /**
     * パフォーマンスメトリクスの測定
     * @param {string} name - 測定名
     * @param {Function} fn - 測定する関数
     * @returns {*} 関数の実行結果
     */
    measurePerformance(name, fn) {
        const startTime = performance.now();
        const result = fn();
        const endTime = performance.now();
        
        const duration = endTime - startTime;
        this.metrics[name] = duration;
        
        console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
        return result;
    }

    /**
     * リソースの遅延読み込み
     * @param {string} src - リソースのURL
     * @param {string} type - リソースのタイプ（'image', 'script', 'style'）
     * @returns {Promise} 読み込み完了のPromise
     */
    lazyLoadResource(src, type = 'image') {
        return new Promise((resolve, reject) => {
            let element;
            
            switch (type) {
                case 'image':
                    element = new Image();
                    element.onload = () => resolve(element);
                    element.onerror = reject;
                    element.src = src;
                    break;
                    
                case 'script':
                    element = document.createElement('script');
                    element.onload = () => resolve(element);
                    element.onerror = reject;
                    element.src = src;
                    document.head.appendChild(element);
                    break;
                    
                case 'style':
                    element = document.createElement('link');
                    element.rel = 'stylesheet';
                    element.onload = () => resolve(element);
                    element.onerror = reject;
                    element.href = src;
                    document.head.appendChild(element);
                    break;
                    
                default:
                    reject(new Error(`Unsupported resource type: ${type}`));
            }
        });
    }

    /**
     * バッチ処理の実装
     * @param {Array} items - 処理するアイテムの配列
     * @param {Function} processor - 処理関数
     * @param {number} batchSize - バッチサイズ
     * @param {number} delay - バッチ間の遅延（ミリ秒）
     * @returns {Promise} 処理完了のPromise
     */
    async processBatch(items, processor, batchSize = 10, delay = 0) {
        const results = [];
        
        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            const batchResults = await Promise.all(
                batch.map(item => processor(item))
            );
            results.push(...batchResults);
            
            if (delay > 0 && i + batchSize < items.length) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        return results;
    }

    /**
     * メモリ使用量の監視
     * @returns {Object} メモリ使用量情報
     */
    getMemoryUsage() {
        if ('memory' in performance) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1048576),
                total: Math.round(performance.memory.totalJSHeapSize / 1048576),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
            };
        }
        return null;
    }

    /**
     * パフォーマンスレポートの生成
     * @returns {Object} パフォーマンスレポート
     */
    generateReport() {
        return {
            metrics: this.metrics,
            memory: this.getMemoryUsage(),
            cacheSize: this.cache.size,
            observersCount: this.observers.size
        };
    }

    /**
     * クリーンアップ
     */
    cleanup() {
        // キャッシュのクリア
        this.cache.clear();
        
        // Observer の切断
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
    }
}
