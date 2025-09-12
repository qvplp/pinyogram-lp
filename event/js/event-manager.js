/**
 * イベント管理システム
 * 新規イベント登録、更新、OGP生成を統合的に管理
 */

class EventManager {
    constructor() {
        this.ogpGenerator = new EventOGPGenerator();
        this.eventsDataPath = '/event/data/events.json';
        this.events = [];
    }

    /**
     * イベントデータを読み込み
     */
    async loadEvents() {
        try {
            const response = await fetch(this.eventsDataPath);
            const data = await response.json();
            this.events = data.events || data || [];
            return this.events;
        } catch (error) {
            console.error('Failed to load events:', error);
            return [];
        }
    }

    /**
     * 新規イベントを登録
     * @param {Object} eventData - イベントデータ
     * @returns {Promise<boolean>} - 登録成功可否
     */
    async createEvent(eventData) {
        try {
            // イベントIDを生成（既存のIDと重複しないように）
            const eventId = eventData.event_id || this.generateEventId(eventData.event_name);
            
            // イベントデータを正規化
            const normalizedEvent = {
                event_id: eventId,
                event_name: eventData.event_name,
                event_date: eventData.event_date,
                description: eventData.description,
                slug: eventData.slug || this.generateSlug(eventData.event_name),
                venue: eventData.venue || {},
                pricing: eventData.pricing || {},
                models: eventData.models || [],
                ...eventData
            };

            // イベントを配列に追加
            this.events.push(normalizedEvent);

            // OGPページを生成
            await this.ogpGenerator.generateOGPPage(normalizedEvent);

            // イベントデータを保存（実際の実装ではサーバーサイドで処理）
            await this.saveEvents();

            console.log('Event created successfully:', normalizedEvent.event_id);
            return true;
        } catch (error) {
            console.error('Error creating event:', error);
            return false;
        }
    }

    /**
     * イベントを更新
     * @param {string} eventId - イベントID
     * @param {Object} updateData - 更新データ
     * @returns {Promise<boolean>} - 更新成功可否
     */
    async updateEvent(eventId, updateData) {
        try {
            const eventIndex = this.events.findIndex(e => e.event_id === eventId);
            if (eventIndex === -1) {
                throw new Error(`Event ${eventId} not found`);
            }

            // イベントデータを更新
            this.events[eventIndex] = {
                ...this.events[eventIndex],
                ...updateData
            };

            // OGPページを更新
            await this.ogpGenerator.updateOGPPage(eventId, this.events[eventIndex]);

            // イベントデータを保存
            await this.saveEvents();

            console.log('Event updated successfully:', eventId);
            return true;
        } catch (error) {
            console.error('Error updating event:', error);
            return false;
        }
    }

    /**
     * イベントIDを生成
     * @param {string} eventName - イベント名
     * @returns {string} - 生成されたイベントID
     */
    generateEventId(eventName) {
        const timestamp = Date.now().toString().slice(-6);
        const namePrefix = eventName
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, '')
            .substring(0, 3)
            .toUpperCase();
        return `EVT${namePrefix}${timestamp}`;
    }

    /**
     * イベントスラッグを生成
     * @param {string} eventName - イベント名
     * @returns {string} - 生成されたスラッグ
     */
    generateSlug(eventName) {
        return eventName
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .trim();
    }

    /**
     * イベントデータを保存
     * @returns {Promise<boolean>} - 保存成功可否
     */
    async saveEvents() {
        try {
            // 実際の実装ではサーバーサイドで処理
            // ここではローカルストレージに保存
            localStorage.setItem('events_data', JSON.stringify({
                events: this.events
            }));
            
            console.log('Events saved successfully');
            return true;
        } catch (error) {
            console.error('Error saving events:', error);
            return false;
        }
    }

    /**
     * イベントのOGPページを手動で再生成
     * @param {string} eventId - イベントID
     * @returns {Promise<boolean>} - 再生成成功可否
     */
    async regenerateOGP(eventId) {
        try {
            const event = this.events.find(e => e.event_id === eventId);
            if (!event) {
                throw new Error(`Event ${eventId} not found`);
            }

            await this.ogpGenerator.generateOGPPage(event);
            console.log('OGP regenerated for event:', eventId);
            return true;
        } catch (error) {
            console.error('Error regenerating OGP:', error);
            return false;
        }
    }

    /**
     * 全イベントのOGPページを一括再生成
     * @returns {Promise<boolean>} - 一括再生成成功可否
     */
    async regenerateAllOGP() {
        try {
            for (const event of this.events) {
                await this.ogpGenerator.generateOGPPage(event);
            }
            console.log('All OGP pages regenerated successfully');
            return true;
        } catch (error) {
            console.error('Error regenerating all OGP pages:', error);
            return false;
        }
    }

    /**
     * イベント一覧を取得
     * @returns {Array} - イベント一覧
     */
    getEvents() {
        return this.events;
    }

    /**
     * 特定のイベントを取得
     * @param {string} eventId - イベントID
     * @returns {Object|null} - イベントデータ
     */
    getEvent(eventId) {
        return this.events.find(e => e.event_id === eventId) || null;
    }
}

// グローバルに公開
window.EventManager = EventManager;

// 使用例
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventManager;
}
