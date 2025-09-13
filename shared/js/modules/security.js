/**
 * セキュリティ強化モジュール
 * Zero Trust原則の適用と脆弱性対策
 */

export class SecurityManager {
    constructor() {
        this.allowedOrigins = new Set([
            window.location.origin,
            'https://pinyogram.com',
            'https://www.pinyogram.com'
        ]);
        
        this.sanitizationRules = {
            html: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            xss: /<[^>]*script[^>]*>|javascript:|on\w+\s*=/gi,
            sql: /('|(\\')|(;)|(\-\-)|(\s+union\s+)|(\s+select\s+)|(\s+insert\s+)|(\s+update\s+)|(\s+delete\s+))/gi
        };
    }

    /**
     * 入力値の検証とサニタイゼーション
     * @param {string} input - 検証する入力値
     * @param {string} type - 検証タイプ（'text', 'email', 'url', 'html'）
     * @returns {Object} 検証結果
     */
    validateInput(input, type = 'text') {
        if (typeof input !== 'string') {
            return { isValid: false, error: 'Input must be a string' };
        }

        const sanitized = this.sanitizeInput(input, type);
        
        switch (type) {
            case 'email':
                return this.validateEmail(sanitized);
            case 'url':
                return this.validateUrl(sanitized);
            case 'html':
                return this.validateHtml(sanitized);
            default:
                return this.validateText(sanitized);
        }
    }

    /**
     * 入力値のサニタイゼーション
     * @param {string} input - サニタイズする入力値
     * @param {string} type - サニタイズタイプ
     * @returns {string} サニタイズされた値
     */
    sanitizeInput(input, type = 'text') {
        let sanitized = input.trim();
        
        // XSS対策
        sanitized = sanitized.replace(this.sanitizationRules.xss, '');
        
        // HTMLタグの除去（必要に応じて）
        if (type !== 'html') {
            sanitized = sanitized.replace(/<[^>]*>/g, '');
        }
        
        // SQLインジェクション対策
        sanitized = sanitized.replace(this.sanitizationRules.sql, '');
        
        return sanitized;
    }

    /**
     * テキストの検証
     * @param {string} text - 検証するテキスト
     * @returns {Object} 検証結果
     * @private
     */
    validateText(text) {
        if (text.length === 0) {
            return { isValid: false, error: 'Text cannot be empty' };
        }
        
        if (text.length > 1000) {
            return { isValid: false, error: 'Text is too long' };
        }
        
        return { isValid: true, value: text };
    }

    /**
     * メールアドレスの検証
     * @param {string} email - 検証するメールアドレス
     * @returns {Object} 検証結果
     * @private
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(email)) {
            return { isValid: false, error: 'Invalid email format' };
        }
        
        if (email.length > 254) {
            return { isValid: false, error: 'Email is too long' };
        }
        
        return { isValid: true, value: email };
    }

    /**
     * URLの検証
     * @param {string} url - 検証するURL
     * @returns {Object} 検証結果
     * @private
     */
    validateUrl(url) {
        try {
            const urlObj = new URL(url);
            
            // 許可されたオリジンのみ
            if (!this.allowedOrigins.has(urlObj.origin)) {
                return { isValid: false, error: 'URL origin not allowed' };
            }
            
            // プロトコルの検証
            if (!['http:', 'https:'].includes(urlObj.protocol)) {
                return { isValid: false, error: 'Invalid protocol' };
            }
            
            return { isValid: true, value: url };
        } catch (error) {
            return { isValid: false, error: 'Invalid URL format' };
        }
    }

    /**
     * HTMLの検証
     * @param {string} html - 検証するHTML
     * @returns {Object} 検証結果
     * @private
     */
    validateHtml(html) {
        // 危険なタグの検出
        if (this.sanitizationRules.html.test(html)) {
            return { isValid: false, error: 'Script tags not allowed' };
        }
        
        // イベントハンドラーの検出
        if (/on\w+\s*=/i.test(html)) {
            return { isValid: false, error: 'Event handlers not allowed' };
        }
        
        return { isValid: true, value: html };
    }

    /**
     * CSRFトークンの生成
     * @returns {string} CSRFトークン
     */
    generateCSRFToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * セキュアなランダム文字列の生成
     * @param {number} length - 文字列の長さ
     * @returns {string} ランダム文字列
     */
    generateSecureRandomString(length = 16) {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        
        return Array.from(array, byte => charset[byte % charset.length]).join('');
    }

    /**
     * データの暗号化（簡易版）
     * @param {string} data - 暗号化するデータ
     * @param {string} key - 暗号化キー
     * @returns {string} 暗号化されたデータ
     */
    async encryptData(data, key) {
        try {
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(data);
            const keyBuffer = encoder.encode(key);
            
            const cryptoKey = await crypto.subtle.importKey(
                'raw',
                keyBuffer,
                { name: 'AES-GCM' },
                false,
                ['encrypt']
            );
            
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encrypted = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                cryptoKey,
                dataBuffer
            );
            
            const result = new Uint8Array(iv.length + encrypted.byteLength);
            result.set(iv);
            result.set(new Uint8Array(encrypted), iv.length);
            
            return btoa(String.fromCharCode(...result));
        } catch (error) {
            console.error('Encryption failed:', error);
            throw new Error('Encryption failed');
        }
    }

    /**
     * データの復号化（簡易版）
     * @param {string} encryptedData - 復号化するデータ
     * @param {string} key - 復号化キー
     * @returns {string} 復号化されたデータ
     */
    async decryptData(encryptedData, key) {
        try {
            const decoder = new TextDecoder();
            const keyBuffer = new TextEncoder().encode(key);
            
            const cryptoKey = await crypto.subtle.importKey(
                'raw',
                keyBuffer,
                { name: 'AES-GCM' },
                false,
                ['decrypt']
            );
            
            const data = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
            const iv = data.slice(0, 12);
            const encrypted = data.slice(12);
            
            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                cryptoKey,
                encrypted
            );
            
            return decoder.decode(decrypted);
        } catch (error) {
            console.error('Decryption failed:', error);
            throw new Error('Decryption failed');
        }
    }

    /**
     * セキュリティヘッダーの設定
     */
    setSecurityHeaders() {
        // Content Security Policy
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;";
        document.head.appendChild(meta);
        
        // X-Frame-Options - HTTPヘッダーでのみ設定可能なためコメントアウト
        // const frameOptions = document.createElement('meta');
        // frameOptions.httpEquiv = 'X-Frame-Options';
        // frameOptions.content = 'DENY';
        // document.head.appendChild(frameOptions);
        
        // X-Content-Type-Options
        const contentType = document.createElement('meta');
        contentType.httpEquiv = 'X-Content-Type-Options';
        contentType.content = 'nosniff';
        document.head.appendChild(contentType);
    }

    /**
     * セキュリティ監査の実行
     * @returns {Object} 監査結果
     */
    performSecurityAudit() {
        const audit = {
            timestamp: new Date().toISOString(),
            vulnerabilities: [],
            recommendations: []
        };
        
        // XSS脆弱性のチェック
        const scripts = document.querySelectorAll('script');
        scripts.forEach(script => {
            if (script.src && !this.allowedOrigins.has(new URL(script.src).origin)) {
                audit.vulnerabilities.push({
                    type: 'XSS',
                    severity: 'high',
                    description: 'External script from untrusted origin',
                    element: script
                });
            }
        });
        
        // フォームの検証
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            if (!form.hasAttribute('novalidate')) {
                audit.recommendations.push({
                    type: 'Form Validation',
                    description: 'Add client-side validation to form',
                    element: form
                });
            }
        });
        
        return audit;
    }
}
