// コンテスト詳細ページのJavaScript
class ContestDetailManager {
    constructor() {
        this.contestData = null;
        this.submissionsData = null;
        this.currentContestId = null;
        this.init();
    }

    async init() {
        await this.loadContestData();
        await this.loadSubmissionsData();
        this.getContestIdFromURL();
        this.loadContestDetail();
        this.loadSubmissions();
        this.setupEventListeners();
    }

    async loadContestData() {
        try {
            const response = await fetch('data/contests.json');
            this.contestData = await response.json();
        } catch (error) {
            console.error('コンテストデータの読み込みに失敗しました:', error);
        }
    }

    async loadSubmissionsData() {
        try {
            const response = await fetch('data/submissions.json');
            this.submissionsData = await response.json();
        } catch (error) {
            console.error('応募データの読み込みに失敗しました:', error);
        }
    }

    getContestIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        this.currentContestId = urlParams.get('id');
        
        if (!this.currentContestId) {
            // IDが指定されていない場合は最初のコンテストを表示
            this.currentContestId = this.contestData?.contests[0]?.id || 'CONTEST001';
        }
    }

    loadContestDetail() {
        if (!this.contestData || !this.currentContestId) return;

        const contest = this.contestData.contests.find(c => c.id === this.currentContestId);
        if (!contest) {
            console.error('指定されたコンテストが見つかりません');
            return;
        }

        this.updateContestInfo(contest);
        this.updateContestStatus(contest);
        this.loadRelatedEvents();
    }

    updateContestInfo(contest) {
        // 基本情報の更新
        document.getElementById('contestTitle').textContent = contest.title;
        document.getElementById('contestDetailTitle').textContent = contest.title;
        document.getElementById('contestDetailSubtitle').textContent = contest.subtitle;
        document.getElementById('contestDetailDescription').textContent = contest.description;
        
        // 指定されたコンテンツに更新
        if (contest.id === 'CONTEST001') {
            document.getElementById('contestDetailTitle').textContent = '春のポートレートコンテスト';
            document.getElementById('contestDetailSubtitle').textContent = '桜と共に美しい瞬間を';
            document.getElementById('contestDetailDescription').textContent = '桜の季節にぴったりのポートレート写真を募集します。自然光を活かした美しい写真をお待ちしています。';
        }
        
        // 画像の更新
        const contestImage = document.getElementById('contestImage');
        contestImage.src = contest.image;
        contestImage.alt = contest.title;
        
        // メタ情報の更新（不要な情報は削除）
        // テーマと応募期間の更新
        const startDate = new Date(contest.startDate).toLocaleDateString('ja-JP');
        const endDate = new Date(contest.endDate).toLocaleDateString('ja-JP');
        document.getElementById('contestTheme').textContent = contest.subtitle;
        document.getElementById('contestEntryPeriod').textContent = `${startDate} - ${endDate}`;
        
        // ページタイトルの更新
        document.title = `${contest.title} | ぴにょぐらむ撮影会`;
    }

    updateContestStatus(contest) {
        // JST時間に変換（UTC+9）
        const now = new Date();
        const jstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));
        const startDate = new Date(contest.startDate);
        const endDate = new Date(contest.endDate);
        
        console.log('現在時刻 (JST):', jstNow.toLocaleString('ja-JP'));
        console.log('開始日時:', startDate.toLocaleString('ja-JP'));
        console.log('終了日時:', endDate.toLocaleString('ja-JP'));
        
        const statusElement = document.getElementById('contestStatus');
        const entryButton = document.getElementById('entryButton');
        
        if (jstNow < startDate) {
            // 開催前
            statusElement.textContent = '開催予定';
            statusElement.className = 'contest-status upcoming';
            entryButton.disabled = true;
            entryButton.innerHTML = '<i class="fas fa-clock"></i> 応募開始までお待ちください';
            entryButton.className = 'btn-primary';
        } else if (jstNow >= startDate && jstNow <= endDate) {
            // 開催中
            statusElement.textContent = '開催中';
            statusElement.className = 'contest-status active';
            entryButton.disabled = false;
            entryButton.innerHTML = '<i class="fas fa-camera"></i> 応募する';
            entryButton.className = 'btn-primary';
            entryButton.onclick = () => {
                // 応募フォームに遷移（実装予定）
                alert('応募フォームは準備中です。しばらくお待ちください。');
            };
        } else {
            // 終了
            statusElement.textContent = '終了';
            statusElement.className = 'contest-status ended';
            entryButton.disabled = true;
            entryButton.innerHTML = '<i class="fas fa-times"></i> 応募終了';
            entryButton.className = 'btn-primary';
        }
    }

    async loadRelatedEvents() {
        try {
            // 関連イベントを読み込み（実際の実装では適切なAPIエンドポイントを使用）
            const response = await fetch('../event/data/events.json');
            const eventData = await response.json();
            
            const relatedEventsGrid = document.getElementById('relatedEventsGrid');
            relatedEventsGrid.innerHTML = '';
            
            // 最初の3つのイベントを表示
            eventData.events.slice(0, 3).forEach(event => {
                const eventCard = this.createEventCard(event);
                relatedEventsGrid.appendChild(eventCard);
            });
        } catch (error) {
            console.error('関連イベントの読み込みに失敗しました:', error);
        }
    }

    createEventCard(event) {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.innerHTML = `
            <div class="event-image">
                <img src="${event.image}" alt="${event.title}">
                <div class="event-date">
                    <span class="month">${new Date(event.date).toLocaleDateString('ja-JP', { month: 'short' })}</span>
                    <span class="day">${new Date(event.date).getDate()}</span>
                </div>
            </div>
            <div class="event-content">
                <h3>${event.title}</h3>
                <p>${event.description}</p>
                <div class="event-meta">
                    <span class="location"><i class="fas fa-map-marker-alt"></i> ${event.location}</span>
                    <span class="time"><i class="fas fa-clock"></i> ${event.time}</span>
                </div>
                <a href="../event/event-detail.html?id=${event.id}" class="btn-secondary">詳細を見る</a>
            </div>
        `;
        return card;
    }

    setupEventListeners() {
        // 応募ボタンのクリックイベント
        const entryButton = document.getElementById('entryButton');
        entryButton.addEventListener('click', () => {
            if (!entryButton.disabled) {
                this.handleEntryClick();
            }
        });

        // シェアボタンのクリックイベント
        const shareButton = document.getElementById('shareButton');
        shareButton.addEventListener('click', () => {
            this.handleShareClick();
        });
    }

    handleEntryClick() {
        // 応募フォームへの遷移（実際の実装では適切なページに遷移）
        alert('応募フォームは準備中です。しばらくお待ちください。');
    }

    handleShareClick() {
        if (navigator.share) {
            navigator.share({
                title: document.getElementById('contestDetailTitle').textContent,
                text: document.getElementById('contestDetailDescription').textContent,
                url: window.location.href
            });
        } else {
            // フォールバック: URLをクリップボードにコピー
            navigator.clipboard.writeText(window.location.href).then(() => {
                alert('URLをクリップボードにコピーしました！');
            });
        }
    }

    loadSubmissions() {
        if (!this.submissionsData || !this.currentContestId) {
            return;
        }

        const submissionsGrid = document.getElementById('submissionsGrid');
        if (!submissionsGrid) {
            return;
        }

        // 現在のコンテストに対応する応募作品をフィルタリング
        const contestSubmissions = this.submissionsData.submissions.filter(
            submission => submission.contestId === this.currentContestId
        );

        // グリッドをクリア
        submissionsGrid.innerHTML = '';

        if (contestSubmissions.length === 0) {
            submissionsGrid.innerHTML = '<p style="text-align: center; color: #7f8c8d; grid-column: 1 / -1;">まだ応募作品がありません。</p>';
            return;
        }

        // 応募作品カードを生成
        contestSubmissions.forEach(submission => {
            const card = this.createSubmissionCard(submission);
            submissionsGrid.appendChild(card);
        });
    }

    createSubmissionCard(submission) {
        const card = document.createElement('div');
        card.className = 'submission-card';
        
        // 日付をフォーマット
        const date = new Date(submission.submittedAt);
        const formattedDate = date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        card.innerHTML = `
            <div class="submission-image">
                <img src="${submission.image}" alt="${submission.title}" loading="lazy">
            </div>
            <div class="submission-info">
                <h3 class="submission-title">${submission.title}</h3>
                <p class="submission-author">by ${submission.author}</p>
                <div class="submission-stats">
                    <div class="submission-likes">
                        <i class="fas fa-heart"></i>
                        ${submission.likes}
                    </div>
                    <div class="submission-date">${formattedDate}</div>
                </div>
            </div>
        `;

        // カードクリック時のイベント（拡大表示など）
        card.addEventListener('click', () => {
            this.handleSubmissionClick(submission);
        });

        return card;
    }

    handleSubmissionClick(submission) {
        // 応募作品の詳細表示（モーダルなど）
        console.log('応募作品をクリック:', submission);
        // 実際の実装では、モーダルや詳細ページに遷移する処理を追加
    }
}

// ページ読み込み完了時に初期化
document.addEventListener('DOMContentLoaded', () => {
    new ContestDetailManager();
});
