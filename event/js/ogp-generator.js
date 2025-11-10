/**
 * イベントOGP生成ユーティリティ
 * 新規イベント登録時に動的にOGPページを生成するためのシステム
 */

class EventOGPGenerator {
    constructor() {
        this.templatePath = '/event/templates/event-ogp-template.html';
        this.eventsDataPath = '/event/data/events.json';
        // 固定OGP画像の上書き設定（イベント単位）
        this.OVERRIDE_OG_IMAGE_BY_EVENT_ID = {
            // EVT005: ご指定のOGP画像に固定
            EVT005: 'https://images.pinyogram.com/events/2025%3A10%3A21%E3%82%BB%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3%E6%92%AE%E5%BD%B1%E4%BC%9Awith%E7%A6%8F%E5%B3%B6%E8%A3%95%E4%BA%8C/main/Frame%2056.png',
            // EVT006: ご指定のOGP画像に固定
            EVT006: 'https://images.pinyogram.com/events/2025-11-18%20%E3%82%BB%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3%E6%92%AE%E5%BD%B1%E4%BC%9A/main/1118.png'
        };
    }

    /**
     * イベントスラッグをURLエンコードされた形式に変換
     * @param {string} slug - イベントスラッグ
     * @returns {string} - URLエンコードされたスラッグ
     */
    encodeEventSlug(slug) {
        if (!slug) return '';
        // スラッグ内のスラッシュをコロンに変換（Cloudflare R2のパス構造に対応）
        return slug.replace(/\//g, ':');
    }

    /**
     * イベント画像URLを生成
     * @param {string} eventSlug - イベントスラッグ
     * @param {string} imageType - 画像タイプ（main, models等）
     * @param {string} imageName - 画像名（hero, 1, 2等）
     * @param {string} extension - 画像拡張子（png, jpg, webp）
     * @returns {string} - 完全な画像URL
     */
    generateEventImageUrl(eventSlug, imageType = 'main', imageName = 'hero', extension = 'png') {
        const encodedSlug = this.encodeEventSlug(eventSlug);
        return `https://images.pinyogram.com/events/${encodedSlug}/${imageType}/${imageName}.${extension}`;
    }

    /**
     * イベント用の代表画像URLを解決
     * - 明示的に `thumbnail_image` が http(s) のフルURLで指定されていればそれを最優先で使用
     * - それ以外は従来どおり slug ベースの hero.png を参照
     * @param {Object} eventData
     * @returns {string}
     */
    resolveEventImageUrl(eventData) {
        // イベントIDでの明示的な上書きがあれば最優先
        const eid = eventData?.event_id;
        if (eid && this.OVERRIDE_OG_IMAGE_BY_EVENT_ID[eid]) {
            return this.OVERRIDE_OG_IMAGE_BY_EVENT_ID[eid];
        }
        const explicit = eventData?.thumbnail_image;
        if (typeof explicit === 'string' && /^https?:\/\//.test(explicit)) {
            return explicit;
        }
        const fallbackSlug = eventData?.slug || eventData?.event_name || '';
        return this.generateEventImageUrl(fallbackSlug, 'main', 'hero', 'png');
    }

    /**
     * イベントOGPページのHTMLを生成
     * @param {Object} eventData - イベントデータ
     * @returns {string} - 生成されたHTML
     */
    generateOGPHTML(eventData) {
        const {
            event_id,
            event_name,
            description,
            slug,
            event_date,
            venue
        } = eventData;

        // イベント画像URLを生成（サムネイルURLが明示されていれば優先）
        const eventImageUrl = this.resolveEventImageUrl(eventData);
        
        // イベントURLを生成
        const eventUrl = `${window.location.origin}/event/${event_id}/`;
        
        // キーワードを生成（イベント名と会場名から）
        const keywords = [
            'ぴにょぐらむ',
            '撮影会',
            'イベント',
            event_name,
            venue?.venue_name || ''
        ].filter(Boolean).join(', ');

        // テンプレートのプレースホルダーを置換
        const template = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${event_name} | ぴにょぐらむ撮影会</title>

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="ぴにょぐらむ撮影会">
    <meta property="og:title" content="${event_name}">
    <meta property="og:description" content="${description || 'ぴにょぐらむ撮影会のイベントです'}">
    <meta property="og:image" content="${eventImageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${event_name} - ${description || 'ぴにょぐらむ撮影会のイベントです'}">
    <meta property="og:url" content="${eventUrl}">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${event_name}">
    <meta name="twitter:description" content="${description || 'ぴにょぐらむ撮影会のイベントです'}">
    <meta name="twitter:image" content="${eventImageUrl}">
    <meta name="twitter:image:alt" content="${event_name} - ${description || 'ぴにょぐらむ撮影会のイベントです'}">

    <!-- 追加SEOメタタグ -->
    <meta name="description" content="${description || 'ぴにょぐらむ撮影会のイベントです'}">
    <meta name="keywords" content="${keywords}">

    <noscript>
        <meta http-equiv="refresh" content="0; url=/event/event-detail.html?id=${event_id}">
    </noscript>
    <script>
        window.location.replace('/event/event-detail.html?id=${event_id}');
    </script>
</head>
<body></body>
</html>`;

        return template;
    }

    /**
     * イベントOGPページを生成してファイルに保存（サーバーサイド実装が必要）
     * @param {Object} eventData - イベントデータ
     * @returns {Promise<boolean>} - 生成成功可否
     */
    async generateOGPPage(eventData) {
        try {
            const html = this.generateOGPHTML(eventData);
            const fileName = `${eventData.event_id}/index.html`;
            const filePath = `/event/${fileName}`;
            
            // 実際のファイル保存はサーバーサイドで実装が必要
            // ここではコンソールに出力して確認
            console.log('Generated OGP HTML for event:', eventData.event_id);
            console.log('File path:', filePath);
            console.log('HTML preview:', html.substring(0, 500) + '...');
            
            return true;
        } catch (error) {
            console.error('Error generating OGP page:', error);
            return false;
        }
    }

    /**
     * 既存のイベントOGPページを更新
     * @param {string} eventId - イベントID
     * @param {Object} eventData - 更新されたイベントデータ
     * @returns {Promise<boolean>} - 更新成功可否
     */
    async updateOGPPage(eventId, eventData) {
        return await this.generateOGPPage(eventData);
    }

    /**
     * イベントデータからOGPメタタグを動的に生成
     * @param {Object} eventData - イベントデータ
     * @returns {Object} - OGPメタタグオブジェクト
     */
    generateOGPMetaTags(eventData) {
        const {
            event_id,
            event_name,
            description,
            slug,
            venue
        } = eventData;

        const eventImageUrl = this.resolveEventImageUrl(eventData);
        const eventUrl = `${window.location.origin}/event/${event_id}/`;
        const keywords = [
            'ぴにょぐらむ',
            '撮影会',
            'イベント',
            event_name,
            venue?.venue_name || ''
        ].filter(Boolean).join(', ');

        // 代表的なOGP推奨サイズを複数用意（同一URLでも可：プラットフォームが最適解像度を選択）
        const ogImageVariants = [
            { url: eventImageUrl, width: '1200', height: '630' },  // 汎用（Facebook/Twitter）
            { url: eventImageUrl, width: '1200', height: '628' },  // Twitter推奨
            { url: eventImageUrl, width: '800',  height: '418' },  // 小さめ横長
            { url: eventImageUrl, width: '600',  height: '315' },  // 旧来サイズ
            { url: eventImageUrl, width: '1200', height: '1200' }  // 正方形（プラットフォーム互換用）
        ];

        return {
            title: `${event_name} | ぴにょぐらむ撮影会`,
            ogType: 'website',
            ogSiteName: 'ぴにょぐらむ撮影会',
            ogTitle: event_name,
            ogDescription: description || 'ぴにょぐらむ撮影会のイベントです',
            ogImage: eventImageUrl,
            ogImageWidth: '1200',
            ogImageHeight: '630',
            ogImageAlt: `${event_name} - ${description || 'ぴにょぐらむ撮影会のイベントです'}`,
            ogUrl: eventUrl,
            twitterCard: 'summary_large_image',
            twitterTitle: event_name,
            twitterDescription: description || 'ぴにょぐらむ撮影会のイベントです',
            twitterImage: eventImageUrl,
            twitterImageAlt: `${event_name} - ${description || 'ぴにょぐらむ撮影会のイベントです'}`,
            description: description || 'ぴにょぐらむ撮影会のイベントです',
            keywords: keywords,
            ogImageVariants
        };
    }
}

// グローバルに公開
window.EventOGPGenerator = EventOGPGenerator;

// 使用例
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventOGPGenerator;
}
