/**
 * イベントOGP生成ユーティリティ
 * 新規イベント登録時に動的にOGPページを生成するためのシステム
 */

class EventOGPGenerator {
    constructor() {
        this.templatePath = '/event/templates/event-ogp-template.html';
        this.eventsDataPath = '/event/data/events.json';
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

        // イベント画像URLを生成
        const eventImageUrl = this.generateEventImageUrl(slug || event_name, 'main', 'hero', 'png');
        
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

        const eventImageUrl = this.generateEventImageUrl(slug || event_name, 'main', 'hero', 'png');
        const eventUrl = `${window.location.origin}/event/${event_id}/`;
        const keywords = [
            'ぴにょぐらむ',
            '撮影会',
            'イベント',
            event_name,
            venue?.venue_name || ''
        ].filter(Boolean).join(', ');

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
            keywords: keywords
        };
    }
}

// グローバルに公開
window.EventOGPGenerator = EventOGPGenerator;

// 使用例
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventOGPGenerator;
}
