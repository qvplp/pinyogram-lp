/**
 * events.js - イベント一覧表示機能
 */

// イベントカードの生成
function createEventCard(event) {
    const eventDate = new Date(event.event_date);
    const formattedDate = `${eventDate.getMonth() + 1}/${eventDate.getDate()}`;
    
    // 画像のフォールバック処理
    const imageUrl = event.thumbnail_image || 'images/events/default.jpg';
    
    return `
        <div class="event-card" data-event-id="${event.event_id}">
            <div class="event-image">
                <img src="${imageUrl}" 
                     alt="${event.event_name}"
                     onerror="this.style.display='none'; this.parentElement.classList.add('no-image');">
                ${event.is_new ? '<span class="badge badge-new">NEW</span>' : ''}
                ${event.is_popular ? '<span class="badge badge-popular">人気</span>' : ''}
            </div>
            <div class="event-content">
                <h3 class="event-title">${event.event_name}</h3>
                <div class="event-info">
                    <span class="event-date">
                        <i class="far fa-calendar"></i> ${formattedDate}
                    </span>
                    <span class="event-venue">
                        <i class="fas fa-map-marker-alt"></i> ${event.venue.venue_name}
                    </span>
                </div>
                <div class="event-price">
                    <span class="price-label">参加費</span>
                    <span class="price-amount">¥${event.pricing.base_price.toLocaleString()}〜</span>
                </div>
                <div class="card-actions">
                    <a href="event-detail.html?id=${event.event_id}" class="btn-detail">
                        詳細を見る
                    </a>
                </div>
            </div>
        </div>
    `;
}

// イベント一覧の表示
async function displayEvents() {
    try {
        const response = await fetch('data/events.json');
        const data = await response.json();
        const events = data.events || data;
        
        const eventsContainer = document.querySelector('.events-grid');
        if (!eventsContainer) return;
        
        // イベントカードを生成
        const eventCards = events.map(event => createEventCard(event)).join('');
        eventsContainer.innerHTML = eventCards;
        
        // アニメーション適用
        const cards = eventsContainer.querySelectorAll('.event-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'all 0.5s ease';
                
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 50);
            }, index * 100);
        });
        
    } catch (error) {
        console.error('イベントの読み込みエラー:', error);
        const eventsContainer = document.querySelector('.events-grid');
        if (eventsContainer) {
            eventsContainer.innerHTML = '<p class="error-message">イベントの読み込み中にエラーが発生しました。</p>';
        }
    }
}

// ページ読み込み時に実行（events.htmlやindex.html以外のページで使用する場合）
if (document.querySelector('.events-grid') && !document.getElementById('eventsGrid')) {
    document.addEventListener('DOMContentLoaded', displayEvents);
}