/**
 * ぴにょぐらむphoto session 予約システム
 */

class ReservationSystem {
    constructor() {
        this.eventData = null;
        this.basePrice = 0;
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
        this.currentStep = 1;
        this.init();
    }
    
    init() {
        this.loadEventData();
        this.setupFormListeners();
        this.setupPriceCalculation();
        this.setupValidation();
    }
    
    // イベントデータの読み込み
    async loadEventData() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const eventId = urlParams.get('id');
            
            if (!eventId) {
                // イベントIDが指定されていない場合はデフォルト表示
                return;
            }
            
            // events.jsonからデータを取得
            const response = await fetch('data/events.json');
            const data = await response.json();
            
            // 配列形式とオブジェクト形式の両方に対応
            const events = data.events || data;
            this.eventData = events.find(event => event.event_id === eventId);
            
            if (this.eventData) {
                this.updateEventInfo();
            }
        } catch (error) {
            console.error('イベントデータの読み込みエラー:', error);
        }
    }
    
    // イベント情報の表示更新
    updateEventInfo() {
        const eventInfoCard = document.getElementById('eventInfo');
        const eventName = document.getElementById('eventName');
        const eventDate = document.getElementById('eventDate');
        const eventVenue = document.getElementById('eventVenue');
        
        if (this.eventData) {
            eventInfoCard.style.display = 'block';
            eventName.textContent = this.eventData.event_name || 'イベント名未設定';
            eventDate.textContent = this.formatDate(this.eventData.event_date);
            eventVenue.textContent = this.eventData.venue?.venue_name || '会場未定';
            
            // 基本料金の設定
            if (this.eventData.pricing?.base_price) {
                this.basePrice = this.eventData.pricing.base_price;
            }
        }
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
    
    // フォームリスナーの設定
    setupFormListeners() {
        const form = document.getElementById('reservationForm');
        
        if (form) {
            // フォーム送信
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (this.validateForm()) {
                    this.submitReservation();
                }
            });
            
            // チェックボックスのスタイル変更
            const checkboxLabels = document.querySelectorAll('.checkbox-label');
            checkboxLabels.forEach(label => {
                const checkbox = label.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    checkbox.addEventListener('change', () => {
                        if (checkbox.checked) {
                            label.classList.add('checked');
                        } else {
                            label.classList.remove('checked');
                        }
                    });
                }
            });
            
            // ラジオボタンのスタイル変更
            const radioLabels = document.querySelectorAll('.radio-label');
            radioLabels.forEach(label => {
                const radio = label.querySelector('input[type="radio"]');
                if (radio) {
                    radio.addEventListener('change', () => {
                        // 同じname属性のラジオボタンのスタイルをリセット
                        document.querySelectorAll(`input[name="${radio.name}"]`).forEach(r => {
                            r.closest('.radio-label').classList.remove('checked');
                        });
                        if (radio.checked) {
                            label.classList.add('checked');
                        }
                    });
                }
            });
        }
    }
    
    // 料金計算のセットアップ
    setupPriceCalculation() {
        // セッションタイプの変更
        const sessionRadios = document.querySelectorAll('input[name="sessionType"]');
        sessionRadios.forEach(radio => {
            radio.addEventListener('change', () => this.calculateTotal());
        });
        
        // 参加人数の変更
        const participants = document.getElementById('participants');
        if (participants) {
            participants.addEventListener('input', () => this.calculateTotal());
        }
        
        // オプションの変更
        const optionCheckboxes = document.querySelectorAll('input[name="options"]');
        optionCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.calculateTotal();
                // オプション表示の切り替え
                const optionId = checkbox.value + 'Option';
                const optionElement = document.getElementById(optionId);
                if (optionElement) {
                    optionElement.style.display = checkbox.checked ? 'flex' : 'none';
                }
            });
        });
    }
    
    // 合計金額の計算
    calculateTotal() {
        let basePrice = 0;
        let optionTotal = 0;
        
        // セッションタイプの料金
        const selectedSession = document.querySelector('input[name="sessionType"]:checked');
        if (selectedSession) {
            basePrice = this.sessionPrices[selectedSession.value] || 0;
        }
        
        // 参加人数
        const participants = parseInt(document.getElementById('participants').value) || 1;
        basePrice = basePrice * participants;
        
        // オプション料金
        const selectedOptions = document.querySelectorAll('input[name="options"]:checked');
        selectedOptions.forEach(option => {
            optionTotal += this.optionPrices[option.value] || 0;
        });
        
        // 表示更新
        const basePriceElement = document.getElementById('basePrice');
        const totalPriceElement = document.getElementById('totalPrice');
        
        if (basePriceElement) {
            basePriceElement.textContent = `¥${basePrice.toLocaleString()}`;
        }
        if (totalPriceElement) {
            totalPriceElement.textContent = `¥${(basePrice + optionTotal).toLocaleString()}`;
        }
    }
    
    // バリデーション設定
    setupValidation() {
        // リアルタイムバリデーション
        const inputs = document.querySelectorAll('input[required], select[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                // エラー状態の場合のみリアルタイムで再検証
                if (input.closest('.form-group').classList.contains('error')) {
                    this.validateField(input);
                }
            });
        });
    }
    
    // フィールド単体のバリデーション
    validateField(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return true;
        
        let isValid = true;
        
        // 必須チェック
        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
        }
        
        // メールアドレスの検証
        if (field.type === 'email' && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            isValid = emailRegex.test(field.value);
        }
        
        // 電話番号の検証
        if (field.type === 'tel' && field.value) {
            const phoneRegex = /^[0-9]{10,11}$/;
            isValid = phoneRegex.test(field.value);
        }
        
        // ラジオボタンの検証
        if (field.type === 'radio') {
            const radioGroup = document.querySelectorAll(`input[name="${field.name}"]`);
            isValid = Array.from(radioGroup).some(radio => radio.checked);
        }
        
        // エラー表示の切り替え
        if (isValid) {
            formGroup.classList.remove('error');
        } else {
            formGroup.classList.add('error');
        }
        
        return isValid;
    }
    
    // フォーム全体のバリデーション
    validateForm() {
        let isValid = true;
        const requiredFields = document.querySelectorAll('#reservationForm [required]');
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        // 利用規約の確認
        const termsCheckbox = document.getElementById('terms');
        if (termsCheckbox && !termsCheckbox.checked) {
            alert('利用規約に同意してください。');
            isValid = false;
        }
        
        return isValid;
    }
    
    // 予約データの送信
    async submitReservation() {
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        const formData = new FormData(document.getElementById('reservationForm'));
        const reservationData = {
            eventId: this.eventData?.event_id || 'UNKNOWN',
            eventName: this.eventData?.event_name || 'イベント',
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            sessionType: formData.get('sessionType'),
            participants: formData.get('participants'),
            preferredDate: formData.get('preferredDate'),
            options: formData.getAll('options'),
            message: formData.get('message'),
            timestamp: new Date().toISOString(),
            reservationNumber: this.generateReservationNumber()
        };
        
        // 料金情報も追加
        const totalPrice = document.getElementById('totalPrice').textContent;
        reservationData.totalPrice = totalPrice;
        
        // ここで実際のAPI送信を行う（今回はローカルストレージに保存）
        try {
            await this.saveReservation(reservationData);
            
            // 成功時の処理
            setTimeout(() => {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                this.showConfirmation(reservationData);
            }, 1500);
        } catch (error) {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            alert('予約の送信中にエラーが発生しました。もう一度お試しください。');
        }
    }
    
    // 予約番号の生成
    generateReservationNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `RES${year}${month}${day}${random}`;
    }
    
    // 予約データの保存
    async saveReservation(data) {
        return new Promise((resolve) => {
            // ローカルストレージに保存
            let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
            reservations.push(data);
            localStorage.setItem('reservations', JSON.stringify(reservations));
            
            // 実際のアプリケーションではここでAPIを呼び出す
            // const response = await fetch('/api/reservations', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(data)
            // });
            
            resolve();
        });
    }
    
    // 確認モーダルの表示
    showConfirmation(data) {
        const modal = document.createElement('div');
        modal.className = 'confirmation-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="success-icon">✨</div>
                <h2>予約が完了しました！</h2>
                <p class="reservation-number">${data.reservationNumber}</p>
                <p><strong>${data.name}様</strong></p>
                <p>ご予約ありがとうございます。<br>
                   確認メールを<strong>${data.email}</strong>に送信しました。</p>
                <p>当日お会いできることを楽しみにしております。</p>
                <button onclick="location.href='index.html'">トップページへ戻る</button>
            </div>
        `;
        document.body.appendChild(modal);
        
        // プログレスバーの更新
        const progressSteps = document.querySelectorAll('.progress-step');
        progressSteps.forEach((step, index) => {
            step.classList.remove('active');
            if (index < 3) {
                step.classList.add('completed');
            }
        });
    }
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', () => {
    // reservation.htmlページでのみ実行
    if (document.getElementById('reservationForm')) {
        new ReservationSystem();
    }
});