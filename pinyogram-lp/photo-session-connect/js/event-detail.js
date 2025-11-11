/**
 * event-detail.js - イベント詳細ページの機能（簡略版）
 */

class EventDetailPage {
    constructor() {
        this.eventData = null;
        this.sessionPrices = {
            individual: 6000,
            group: 4800,
            vip: 12000
        };
        this.optionPrices = {
            costume: 3000,
            makeup: 5000,
            data: 10000
        };
        this.init();
    }
    
    async init() {
        await this.loadEventData();
        this.setupFormHandlers();
        this.setupPriceCalculation();
        this.loadRelatedEvents();
    }
    
    // イベントデータの読み込み
    async loadEventData() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const eventId = urlParams.get('id') || 'EVT001';
            
            const response = await fetch('data/events.json');
            const data = await response.json();
            const events = data.events || data;
            
            this.eventData = events.find(event => event.event_id === eventId);
            
            if (this.eventData) {
                this.displayEventInfo();
                this.updateSessionPrices();
            } else {
                console.error('イベントが見つかりません');
                this.showErrorMessage();
            }
        } catch (error) {
            console.error('データ読み込みエラー:', error);
            this.showErrorMessage();
        }
    }
    
    // エラーメッセージ表示
    showErrorMessage() {
        const eventTitle = document.getElementById('eventTitle');
        if (eventTitle) {
            eventTitle.textContent = 'イベントが見つかりません';
        }
        const form = document.getElementById('eventReservationForm');
        if (form) {
            form.style.display = 'none';
        }
    }
    
    // セッション料金の更新
    updateSessionPrices() {
        if (!this.eventData || !this.eventData.pricing) return;
        
        const pricing = this.eventData.pricing;
        
        // セッションオプションの料金を更新
        const sessionOptions = document.querySelectorAll('.session-option');
        sessionOptions.forEach(option => {
            const radio = option.querySelector('input[type="radio"]');
            const priceElement = option.querySelector('.option-price');
            
            if (radio && priceElement) {
                const sessionType = radio.value;
                const price = pricing[sessionType] || pricing.base_price;
                priceElement.textContent = `¥${price.toLocaleString()}`;
                
                // 料金データを更新
                this.sessionPrices[sessionType] = price;
            }
        });
        
        // オプションの料金を更新（データがある場合）
        if (this.eventData.options) {
            this.eventData.options.forEach(option => {
                this.optionPrices[option.id] = option.price;
                
                // UIに反映
                const checkbox = document.querySelector(`input[value="${option.id}"]`);
                if (checkbox) {
                    const priceElement = checkbox.closest('.option-checkbox').querySelector('.option-add-price');
                    if (priceElement) {
                        priceElement.textContent = `+¥${option.price.toLocaleString()}`;
                    }
                }
            });
        }
    }
    
    // イベント情報の表示
    displayEventInfo() {
        // タイトル
        const eventTitle = document.getElementById('eventTitle');
        if (eventTitle) eventTitle.textContent = this.eventData.event_name;
        
        // 日付
        const eventDate = document.getElementById('eventDate');
        if (eventDate) eventDate.textContent = this.formatDate(this.eventData.event_date);
        
        // 会場情報
        const eventVenue = document.getElementById('eventVenue');
        const venueName = document.getElementById('venueName');
        const venueAddress = document.getElementById('venueAddress');
        const venueDetails = document.getElementById('venueDetails');
        
        if (eventVenue) eventVenue.textContent = this.eventData.venue?.venue_name || '会場未定';
        if (venueName) venueName.textContent = this.eventData.venue?.venue_name || '会場未定';
        if (venueAddress) venueAddress.textContent = this.eventData.venue?.address || '住所未定';
        
        // アクセス情報があれば更新
        if (venueDetails && this.eventData.venue?.access) {
            venueDetails.innerHTML = `
                <strong>会場:</strong> ${this.eventData.venue.venue_name}<br>
                <strong>住所:</strong> ${this.eventData.venue.address}<br>
                <strong>アクセス:</strong> ${this.eventData.venue.access}
            `;
        }
        
        // イベント説明
        const eventDescription = document.getElementById('eventDescription');
        if (eventDescription && this.eventData.description) {
            eventDescription.textContent = this.eventData.description;
        }
        
        // 残席状況の更新
        if (this.eventData.remaining_slots !== null && this.eventData.remaining_slots !== undefined) {
            const statusCount = document.querySelector('.status-count');
            if (statusCount) {
                statusCount.innerHTML = `残り<strong>${this.eventData.remaining_slots}</strong>席`;
            }
            
            // プログレスバーの更新
            const maxSlots = this.eventData.max_participants || 10;
            const percentage = ((maxSlots - this.eventData.remaining_slots) / maxSlots) * 100;
            const progressBar = document.querySelector('.status-progress');
            if (progressBar) {
                progressBar.style.width = `${percentage}%`;
            }
        }
        
        // 画像
        const eventImage = document.getElementById('eventImage');
        if (eventImage) {
            eventImage.src = this.eventData.thumbnail_image || 'images/events/default.jpg';
            eventImage.onerror = function() {
                this.style.display = 'none';
                this.parentElement.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
                this.parentElement.style.height = '300px';
                this.parentElement.style.display = 'flex';
                this.parentElement.style.alignItems = 'center';
                this.parentElement.style.justifyContent = 'center';
                this.parentElement.innerHTML = '<span style="font-size: 48px;">📸</span>';
            };
        }
        
        // ページタイトル更新
        document.title = `${this.eventData.event_name} | ぴにょぐらむphoto session`;
    }
    
    // 日付フォーマット
    formatDate(dateString) {
        if (!dateString) return '日程未定';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
        const weekDay = weekDays[date.getDay()];
        return `${year}年${month}月${day}日(${weekDay})`;
    }
    
    // フォームハンドラーの設定
    setupFormHandlers() {
        const form = document.getElementById('eventReservationForm');
        if (!form) return;
        
        // フォーム送信
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.submitReservation();
        });
        
        // セッションオプションのスタイル変更
        const sessionOptions = document.querySelectorAll('.session-option');
        sessionOptions.forEach(option => {
            const radio = option.querySelector('input[type="radio"]');
            radio.addEventListener('change', () => {
                sessionOptions.forEach(opt => opt.classList.remove('selected'));
                if (radio.checked) {
                    option.classList.add('selected');
                }
            });
        });
        
        // チェックボックスのスタイル変更
        const optionCheckboxes = document.querySelectorAll('.option-checkbox');
        optionCheckboxes.forEach(option => {
            const checkbox = option.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    option.classList.add('checked');
                } else {
                    option.classList.remove('checked');
                }
            });
        });
    }
    
    // 料金計算の設定
    setupPriceCalculation() {
        // セッションタイプ変更時
        const sessionRadios = document.querySelectorAll('input[name="sessionType"]');
        sessionRadios.forEach(radio => {
            radio.addEventListener('change', () => this.calculatePrice());
        });
        
        // オプション変更時
        const optionCheckboxes = document.querySelectorAll('input[name="options"]');
        optionCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.calculatePrice());
        });
    }
    
    // 料金計算（参加人数を除外）
    calculatePrice() {
        let basePrice = 0;
        let optionPrice = 0;
        
        // 基本料金
        const selectedSession = document.querySelector('input[name="sessionType"]:checked');
        if (selectedSession) {
            basePrice = this.sessionPrices[selectedSession.value] || 0;
        }
        
        // オプション料金
        const selectedOptions = document.querySelectorAll('input[name="options"]:checked');
        selectedOptions.forEach(option => {
            optionPrice += this.optionPrices[option.value] || 0;
        });
        
        // 表示更新
        document.getElementById('basePrice').textContent = `¥${basePrice.toLocaleString()}`;
        document.getElementById('optionPrice').textContent = `¥${optionPrice.toLocaleString()}`;
        document.getElementById('totalPrice').textContent = `¥${(basePrice + optionPrice).toLocaleString()}`;
        
        // オプション料金行の表示/非表示
        const optionPriceRow = document.getElementById('optionPriceRow');
        if (optionPriceRow) {
            optionPriceRow.style.display = optionPrice > 0 ? 'flex' : 'none';
        }
    }
    
    // 予約送信
    async submitReservation() {
        const form = document.getElementById('eventReservationForm');
        const submitButton = form.querySelector('.btn-reserve-submit');
        
        // バリデーション
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        // 利用規約チェック
        const termsCheckbox = document.getElementById('terms');
        if (!termsCheckbox.checked) {
            alert('利用規約に同意してください。');
            return;
        }
        
        // ボタンを無効化
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 送信中...';
        
        // フォームデータの取得（参加人数を除外）
        const formData = new FormData(form);
        const reservationData = {
            eventId: this.eventData?.event_id,
            eventName: this.eventData?.event_name,
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            sessionType: formData.get('sessionType'),
            options: formData.getAll('options'),
            message: formData.get('message'),
            totalPrice: document.getElementById('totalPrice').textContent,
            reservationNumber: this.generateReservationNumber(),
            timestamp: new Date().toISOString()
        };
        
        // 予約を保存（実際にはAPIを呼び出す）
        try {
            await this.saveReservation(reservationData);
            
            // 成功モーダルを表示
            setTimeout(() => {
                this.showConfirmationModal(reservationData);
                form.reset();
                this.calculatePrice();
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-check"></i> 予約を確定する';
            }, 1500);
        } catch (error) {
            alert('予約の送信に失敗しました。もう一度お試しください。');
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-check"></i> 予約を確定する';
        }
    }
    
    // 予約番号生成
    generateReservationNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `RES${year}${month}${day}${random}`;
    }
    
    // 予約保存（ローカルストレージ）
    async saveReservation(data) {
        return new Promise((resolve) => {
            let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
            reservations.push(data);
            localStorage.setItem('reservations', JSON.stringify(reservations));
            resolve();
        });
    }
    
    // 確認モーダル表示
    showConfirmationModal(data) {
        const modal = document.getElementById('confirmationModal');
        document.getElementById('reservationNumber').textContent = data.reservationNumber;
        document.getElementById('customerName').textContent = data.name;
        document.getElementById('customerEmail').textContent = data.email;
        
        modal.style.display = 'flex';
        
        // モーダル外クリックで閉じる
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    // 関連イベントの読み込み
    async loadRelatedEvents() {
        try {
            const response = await fetch('data/events.json');
            const data = await response.json();
            const events = data.events || data;
            
            // 現在のイベント以外を3件取得
            const relatedEvents = events
                .filter(event => event.event_id !== this.eventData?.event_id)
                .slice(0, 3);
            
            const relatedEventsContainer = document.getElementById('relatedEvents');
            if (relatedEventsContainer && relatedEvents.length > 0) {
                relatedEventsContainer.innerHTML = relatedEvents
                    .map(event => this.createEventCard(event))
                    .join('');
            }
        } catch (error) {
            console.error('関連イベントの読み込みエラー:', error);
        }
    }
    
    // イベントカード生成（関連イベント用）
    createEventCard(event) {
        const eventDate = new Date(event.event_date);
        const formattedDate = `${eventDate.getMonth() + 1}/${eventDate.getDate()}`;
        
        return `
            <div class="event-card">
                <div class="event-image">
                    <img src="${event.thumbnail_image || 'images/events/default.jpg'}" 
                         alt="${event.event_name}"
                         onerror="this.style.display='none'; this.parentElement.classList.add('no-image');">
                </div>
                <div class="event-content">
                    <h3 class="event-title">${event.event_name}</h3>
                    <div class="event-info">
                        <span class="event-date">
                            <i class="far fa-calendar"></i> ${formattedDate}
                        </span>
                    </div>
                    <a href="event-detail.html?id=${event.event_id}" class="btn-view-detail">
                        詳細を見る
                    </a>
                </div>
            </div>
        `;
    }
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', () => {
    new EventDetailPage();
});