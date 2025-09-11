// コンテストページ専用JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // モバイルメニューの初期化
    initMobileMenu();
    
    // 応募フォームの初期化
    initEntryForm();
    
    // ギャラリーの初期化
    initGallery();
    
    // スムーススクロールの初期化
    initSmoothScroll();
    
    // コンテスト一覧の初期化
    initContestList();
    
    // 開催予定コンテストの初期化
    initUpcomingContests();
    
    // ガントチャートの初期化
    initGanttChart();
    
    // 応募作品ギャラリーの初期化
    initSubmissionGallery();
});

// モバイルメニューの機能
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
        
        // メニューリンクをクリックしたらメニューを閉じる
        const menuLinks = navLinks.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            });
        });
    }
}

// 応募フォームの機能
function initEntryForm() {
    const entryForm = document.getElementById('entryForm');
    
    if (entryForm) {
        entryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmission();
        });
        
        // ファイルアップロードのプレビュー機能
        const fileInputs = entryForm.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            input.addEventListener('change', function() {
                handleFilePreview(this);
            });
        });
    }
}

// フォーム送信処理
function handleFormSubmission() {
    const form = document.getElementById('entryForm');
    const formData = new FormData(form);
    
    // バリデーション
    if (!validateForm(formData)) {
        return;
    }
    
    // 送信ボタンを無効化
    const submitBtn = form.querySelector('.btn-submit');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '送信中...';
    submitBtn.disabled = true;
    
    // 実際の送信処理（ここではシミュレーション）
    setTimeout(() => {
        showSuccessMessage();
        form.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// フォームバリデーション
function validateForm(formData) {
    const name = formData.get('name');
    const email = formData.get('email');
    const photo1 = formData.get('photo1');
    const terms = formData.get('terms');
    
    if (!name || name.trim() === '') {
        showError('お名前を入力してください。');
        return false;
    }
    
    if (!email || email.trim() === '') {
        showError('メールアドレスを入力してください。');
        return false;
    }
    
    if (!isValidEmail(email)) {
        showError('正しいメールアドレスを入力してください。');
        return false;
    }
    
    if (!photo1 || photo1.size === 0) {
        showError('写真1を選択してください。');
        return false;
    }
    
    if (!terms) {
        showError('応募要項に同意してください。');
        return false;
    }
    
    // ファイルサイズチェック
    const fileInputs = document.querySelectorAll('input[type="file"]');
    for (let input of fileInputs) {
        if (input.files.length > 0) {
            const file = input.files[0];
            if (file.size > 10 * 1024 * 1024) { // 10MB
                showError(`${input.id}のファイルサイズが大きすぎます。10MB以下のファイルを選択してください。`);
                return false;
            }
        }
    }
    
    return true;
}

// メールアドレス形式チェック
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ファイルプレビュー機能
function handleFilePreview(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // プレビュー画像を表示（必要に応じて実装）
            console.log('ファイルプレビュー:', e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

// 成功メッセージ表示
function showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'success-message';
    message.innerHTML = `
        <div class="message-content">
            <i class="fas fa-check-circle"></i>
            <h3>応募完了！</h3>
            <p>フォトコンテストへの応募が完了しました。<br>選考結果は9月15日に発表いたします。</p>
        </div>
    `;
    
    document.body.appendChild(message);
    
    // 3秒後にメッセージを削除
    setTimeout(() => {
        message.remove();
    }, 5000);
}

// エラーメッセージ表示
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div class="message-content">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    // 3秒後にメッセージを削除
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// ギャラリーの初期化
function initGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    
    if (galleryGrid) {
        // サンプルデータ（実際の実装ではAPIから取得）
        const samplePhotos = [
            {
                id: 1,
                title: '夏の海辺',
                author: '田中さん',
                image: '../assets/images/events/event001.jpg',
                year: '2023'
            },
            {
                id: 2,
                title: '花火大会',
                author: '佐藤さん',
                image: '../assets/images/events/event002.jpg',
                year: '2023'
            },
            {
                id: 3,
                title: '夏祭り',
                author: '山田さん',
                image: '../assets/images/events/event003.jpg',
                year: '2023'
            },
            {
                id: 4,
                title: '夕日',
                author: '鈴木さん',
                image: '../assets/images/events/event004.jpg',
                year: '2023'
            },
            {
                id: 5,
                title: '夏の山',
                author: '高橋さん',
                image: '../assets/images/events/event005.jpg',
                year: '2023'
            },
            {
                id: 6,
                title: 'プール',
                author: '伊藤さん',
                image: '../assets/images/events/event006.jpg',
                year: '2023'
            }
        ];
        
        renderGallery(samplePhotos);
    }
}

// ギャラリーの描画
function renderGallery(photos) {
    const galleryGrid = document.getElementById('galleryGrid');
    
    if (!galleryGrid) return;
    
    galleryGrid.innerHTML = photos.map(photo => `
        <div class="gallery-item" data-id="${photo.id}">
            <img src="${photo.image}" alt="${photo.title}" class="gallery-image" onerror="this.style.display='none'">
            <div class="gallery-info">
                <div class="gallery-title">${photo.title}</div>
                <div class="gallery-author">${photo.author} (${photo.year})</div>
            </div>
        </div>
    `).join('');
    
    // ギャラリーアイテムにクリックイベントを追加
    const galleryItems = galleryGrid.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const photoId = this.dataset.id;
            openPhotoModal(photoId);
        });
    });
}

// 写真モーダルを開く
function openPhotoModal(photoId) {
    // モーダルの実装（必要に応じて）
    console.log('写真を開く:', photoId);
}

// スムーススクロールの初期化
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// アニメーション用のIntersection Observer
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // アニメーション対象の要素を監視
    const animateElements = document.querySelectorAll('.overview-card, .prize-card, .gallery-item');
    animateElements.forEach(el => {
        observer.observe(el);
    });
}

// コンテストデータ
const contestData = [
    {
        id: 'CONTEST001',
        name: '夏の思い出フォトコンテスト',
        startDate: '2024-08-15',
        endDate: '2024-08-20',
        resultDate: '2024-08-25',
        prize: '¥100,000',
        status: 'active',
        badge: 'active',
        image: '../assets/images/events/event001.jpg',
        description: '夏の思い出をテーマにした写真を募集'
    },
    {
        id: 'CONTEST002',
        name: '花火大会フォトコンテスト',
        startDate: '2024-08-25',
        endDate: '2024-08-30',
        resultDate: '2024-09-05',
        prize: '¥50,000',
        status: 'upcoming',
        badge: 'upcoming',
        image: '../assets/images/events/event002.jpg',
        description: '花火大会の美しい瞬間を撮影'
    },
    {
        id: 'CONTEST003',
        name: '秋の風景フォトコンテスト',
        startDate: '2024-10-01',
        endDate: '2024-10-31',
        resultDate: '2024-11-10',
        prize: '¥80,000',
        status: 'upcoming',
        badge: 'upcoming',
        image: '../assets/images/events/event003.jpg',
        description: '秋の美しい風景をテーマにした写真'
    },
    {
        id: 'CONTEST004',
        name: '海辺フォトコンテスト',
        startDate: '2024-08-05',
        endDate: '2024-08-08',
        resultDate: '2024-08-15',
        prize: '¥25,000',
        status: 'active',
        badge: 'active',
        image: '../assets/images/events/event004.jpg',
        description: '美しい海辺の風景を撮影'
    },
    {
        id: 'CONTEST005',
        name: '夕日フォトコンテスト',
        startDate: '2024-08-12',
        endDate: '2024-08-14',
        resultDate: '2024-08-20',
        prize: '¥20,000',
        status: 'active',
        badge: 'active',
        image: '../assets/images/events/event005.jpg',
        description: '夕日の美しさを表現'
    },
    {
        id: 'CONTEST006',
        name: '春の桜フォトコンテスト',
        startDate: '2024-04-01',
        endDate: '2024-04-30',
        resultDate: '2024-05-15',
        prize: '¥60,000',
        status: 'ended',
        badge: 'ended',
        image: '../assets/images/events/event006.jpg',
        description: '桜の美しい瞬間を撮影した写真'
    }
];

// コンテスト一覧の初期化
function initContestList() {
    generateContestCards();
    generateContestList();
}

// コンテストカードを生成
function generateContestCards() {
    const contestsGrid = document.getElementById('contestsGrid');
    if (!contestsGrid) return;
    
    let html = '';
    
    contestData.forEach(contest => {
        const startDate = new Date(contest.startDate);
        const endDate = new Date(contest.endDate);
        const startMonth = startDate.getMonth() + 1;
        const startDay = startDate.getDate();
        const endMonth = endDate.getMonth() + 1;
        const endDay = endDate.getDate();
        
        let badgeHtml = '';
        if (contest.badge === 'active') {
            badgeHtml = '<span class="contest-badge badge-active">開催中</span>';
        } else if (contest.badge === 'upcoming') {
            badgeHtml = '<span class="contest-badge badge-upcoming">開催予定</span>';
        } else if (contest.badge === 'ended') {
            badgeHtml = '<span class="contest-badge badge-ended">終了</span>';
        }
        
        html += `
            <div class="contest-card" data-id="${contest.id}">
                <div class="contest-card-image">
                    <img src="${contest.image}" alt="${contest.name}" onerror="this.style.display='none'">
                    ${badgeHtml}
                </div>
                <div class="contest-content">
                    <h3 class="contest-title">${contest.name}</h3>
                    <div class="contest-info">📅 ${startMonth}月${startDay}日〜${endMonth}月${endDay}日</div>
                    <div class="contest-info">🏆 賞金: ${contest.prize}</div>
                    <div class="contest-info">📝 ${contest.description}</div>
                </div>
                <div class="contest-footer">
                    <span class="contest-prize">${contest.prize}</span>
                    <span class="contest-status">${contest.status === 'active' ? '開催中' : contest.status === 'upcoming' ? '開催予定' : '終了'}</span>
                </div>
            </div>
        `;
    });
    
    contestsGrid.innerHTML = html;
    
    // コンテストカードにクリックイベントを追加
    document.querySelectorAll('.contest-card').forEach(card => {
        card.addEventListener('click', function() {
            const contestId = this.dataset.id;
            console.log('古いコンテストカードがクリックされました:', contestId);
            window.location.href = `contest-detail.html?id=${contestId}`;
        });
    });
}

// コンテストリストを生成
function generateContestList() {
    const contestList = document.getElementById('contestList');
    if (!contestList) return;
    
    let html = '<h4 class="contest-list-title">🗓 今月のコンテスト</h4>';
    
    contestData.forEach(contest => {
        const startDate = new Date(contest.startDate);
        const endDate = new Date(contest.endDate);
        const day = startDate.getDate();
        const statusText = contest.status === 'active' ? '開催中' : contest.status === 'upcoming' ? '開催予定' : '終了';
        
        html += `
            <div class="contest-list-item" data-id="${contest.id}">
                <div class="contest-list-date">${day}</div>
                <div class="contest-list-info">
                    <div class="contest-list-name">${contest.name}</div>
                    <div class="contest-list-type">${statusText}</div>
                </div>
            </div>
        `;
    });
    
    contestList.innerHTML = html;
    
    // コンテストリストアイテムにクリックイベントを追加
    document.querySelectorAll('.contest-list-item').forEach(item => {
        item.addEventListener('click', function() {
            const contestId = this.dataset.id;
            console.log('古いコンテストリストアイテムがクリックされました:', contestId);
            window.location.href = `contest-detail.html?id=${contestId}`;
        });
    });
}

// コンテスト詳細を開く（廃止 - 新しい実装を使用）
// function openContestDetail(contestId) {
//     const contest = contestData.find(c => c.id === contestId);
//     if (contest) {
//         // コンテスト詳細ページに遷移（実装に応じて）
//         console.log('コンテスト詳細を開く:', contest.name);
//         // window.location.href = `contest-detail.html?id=${contestId}`;
//     }
// }

// ガントチャートの初期化
function initGanttChart() {
    contestCurrentYear = 2024;
    contestCurrentMonth = 8;
    generateGanttChart(contestCurrentYear, contestCurrentMonth);
}

// コンテストカレンダー生成
let contestCurrentYear = 2024;
let contestCurrentMonth = 8;

function generateGanttChart(year, month) {
    const ganttChart = document.getElementById('ganttChart');
    if (!ganttChart) return;
    
    // 当月のコンテストをフィルタリング
    const monthContests = contestData.filter(contest => {
        const startDate = new Date(contest.startDate);
        const endDate = new Date(contest.endDate);
        const resultDate = new Date(contest.resultDate);
        
        return (startDate.getFullYear() === year && startDate.getMonth() + 1 === month) ||
               (endDate.getFullYear() === year && endDate.getMonth() + 1 === month) ||
               (resultDate.getFullYear() === year && resultDate.getMonth() + 1 === month);
    });
    
    // 日付の範囲を計算
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);
    const totalDays = monthEnd.getDate();
    
    let html = `
        <div class="date-header">
            <div class="tick" style="grid-column: 1">1日</div>
            <div class="tick" style="grid-column: 8">8日</div>
            <div class="tick" style="grid-column: 15">15日</div>
            <div class="tick" style="grid-column: 22">22日</div>
            <div class="tick" style="grid-column: 29">29日</div>
        </div>
        <div class="gantt-timeline">
    `;
    
    monthContests.forEach(contest => {
        const startDate = new Date(contest.startDate);
        const endDate = new Date(contest.endDate);
        const resultDate = new Date(contest.resultDate);
        
        // バーの位置と幅を計算（1日から開始）
        const startDay = startDate.getDate();
        const endDay = endDate.getDate();
        const resultDay = resultDate.getDate();
        
        // コンテスト名を短縮
        const shortName = contest.name.length > 20 ? 
            contest.name.substring(0, 20) + '...' : 
            contest.name;
        
        html += `
            <div class="gantt">
                <div class="label" title="${contest.name}">${shortName}</div>
                <div class="track" style="--days: ${totalDays};" data-year="${year}" data-month="${month}">
                    <div class="bar" 
                         style="--start: ${startDay}; --end: ${endDay}; grid-column: var(--start) / calc(var(--end) + 1);"
                         data-start="${startDay}" 
                         data-end="${endDay}"
                         data-range="${month}/${startDay}–${month}/${endDay}"
                         onclick="window.location.href='contest-detail.html?id=${contest.id}'">応募期間</div>
                    <div class="milestone" 
                         style="--day: ${resultDay}; grid-column: var(--day);" 
                         onclick="window.location.href='contest-detail.html?id=${contest.id}'">結果発表</div>
                    <div class="hoverline" aria-hidden="true"></div>
                    <div class="tooltip" aria-hidden="true"></div>
                </div>
            </div>
        `;
    });
    
    html += `
        </div>
        <div class="gantt-legend">
            <div class="gantt-legend-item">
                <div class="gantt-legend-color active"></div>
                <span>開催中</span>
            </div>
            <div class="gantt-legend-item">
                <div class="gantt-legend-color upcoming"></div>
                <span>開催予定</span>
            </div>
            <div class="gantt-legend-item">
                <div class="gantt-legend-color ended"></div>
                <span>結果発表</span>
            </div>
        </div>
    `;
    
    ganttChart.innerHTML = html;
    
    // ガントチャートタイトル更新
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    document.querySelector('.gantt-title').textContent = `📅 ${year}年${monthNames[month - 1]}のコンテストタイムライン`;
    
    // テキストオーバーフロー制御を初期化
    initGanttTextOverflow();
    
    // ホバー機能を初期化
    initGanttHover();
}

// ガントチャートの月変更
function changeGanttMonth(direction) {
    contestCurrentMonth += direction;
    if (contestCurrentMonth > 12) {
        contestCurrentMonth = 1;
        contestCurrentYear++;
    } else if (contestCurrentMonth < 1) {
        contestCurrentMonth = 12;
        contestCurrentYear--;
    }
    generateGanttChart(contestCurrentYear, contestCurrentMonth);
}

// 応募作品ギャラリーのデータ
const submissionData = [
    {
        id: 'SUB001',
        title: '夏の海辺',
        author: '田中さん',
        image: '../assets/images/events/event001.jpg',
        likes: 45,
        isLiked: false,
        isNominated: false,
        date: '2024-08-15'
    },
    {
        id: 'SUB002',
        title: '花火大会',
        author: '佐藤さん',
        image: '../assets/images/events/event002.jpg',
        likes: 32,
        isLiked: true,
        isNominated: false,
        date: '2024-08-14'
    },
    {
        id: 'SUB003',
        title: '夏祭り',
        author: '山田さん',
        image: '../assets/images/events/event003.jpg',
        likes: 28,
        isLiked: false,
        isNominated: true,
        date: '2024-08-13'
    },
    {
        id: 'SUB004',
        title: '夕日',
        author: '鈴木さん',
        image: '../assets/images/events/event004.jpg',
        likes: 67,
        isLiked: true,
        isNominated: true,
        date: '2024-08-12'
    },
    {
        id: 'SUB005',
        title: '夏の山',
        author: '高橋さん',
        image: '../assets/images/events/event005.jpg',
        likes: 23,
        isLiked: false,
        isNominated: false,
        date: '2024-08-11'
    },
    {
        id: 'SUB006',
        title: 'プール',
        author: '伊藤さん',
        image: '../assets/images/events/event006.jpg',
        likes: 41,
        isLiked: false,
        isNominated: false,
        date: '2024-08-10'
    },
    {
        id: 'SUB007',
        title: '海の夕暮れ',
        author: '小林さん',
        image: '../assets/images/events/event001.jpg',
        likes: 56,
        isLiked: true,
        isNominated: false,
        date: '2024-08-09'
    },
    {
        id: 'SUB008',
        title: '夏の花',
        author: '中村さん',
        image: '../assets/images/events/event002.jpg',
        likes: 19,
        isLiked: false,
        isNominated: false,
        date: '2024-08-08'
    }
];

let currentFilter = 'all';
let displayedItems = 8;
let currentImage = null;

// 応募作品ギャラリーの初期化
function initSubmissionGallery() {
    renderGallery();
    initGalleryFilters();
    initLoadMore();
}

// ギャラリーの描画
function renderGallery() {
    const gallery = document.getElementById('submissionGallery');
    if (!gallery) return;
    
    let filteredData = [...submissionData];
    
    // フィルタリング
    switch (currentFilter) {
        case 'recent':
            filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'popular':
            filteredData.sort((a, b) => b.likes - a.likes);
            break;
        case 'liked':
            filteredData = filteredData.filter(item => item.isLiked);
            break;
    }
    
    // 表示件数制限
    const displayData = filteredData.slice(0, displayedItems);
    
    gallery.innerHTML = displayData.map(item => `
        <div class="gallery-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.title}" class="gallery-image" onclick="openGalleryModal('${item.id}')">
            <div class="gallery-item-actions">
                <button class="action-btn like ${item.isLiked ? 'active' : ''}" onclick="toggleLikeFromGallery(event, '${item.id}')">❤️ ${item.likes}</button>
                <button class="action-btn nominate ${item.isNominated ? 'active' : ''}" onclick="toggleNominateFromGallery(event, '${item.id}')">🏆</button>
            </div>
            <div class="gallery-item-info">
                <div class="gallery-item-title">${item.title}</div>
                <div class="gallery-item-author">by ${item.author}</div>
                <div class="gallery-item-stats">
                    <span>❤️ ${item.likes}</span>
                    <span>${formatDate(item.date)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// ギャラリーフィルターの初期化
function initGalleryFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // アクティブ状態を更新
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // フィルターを更新
            currentFilter = this.dataset.filter;
            displayedItems = 8; // リセット
            renderGallery();
            updateLoadMoreButton();
        });
    });
}

// もっと見るボタンの初期化
function initLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            displayedItems += 8;
            renderGallery();
            updateLoadMoreButton();
        });
    }
}

// もっと見るボタンの更新
function updateLoadMoreButton() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!loadMoreBtn) return;
    
    let filteredData = [...submissionData];
    
    switch (currentFilter) {
        case 'recent':
            filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'popular':
            filteredData.sort((a, b) => b.likes - a.likes);
            break;
        case 'liked':
            filteredData = filteredData.filter(item => item.isLiked);
            break;
    }
    
    if (displayedItems >= filteredData.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }
}

// ギャラリーモーダルを開く
function openGalleryModal(itemId) {
    const item = submissionData.find(i => i.id === itemId);
    if (!item) return;
    
    currentImage = item;
    
    document.getElementById('modalImage').src = item.image;
    document.getElementById('modalTitle').textContent = item.title;
    document.getElementById('modalAuthor').textContent = `by ${item.author}`;
    
    // ボタンの状態を更新
    const likeBtn = document.getElementById('modalLikeBtn');
    const nominateBtn = document.getElementById('modalNominateBtn');
    
    likeBtn.classList.toggle('active', item.isLiked);
    nominateBtn.classList.toggle('active', item.isNominated);
    
    document.getElementById('galleryModal').style.display = 'flex';
}

// ギャラリーモーダルを閉じる
function closeGalleryModal() {
    document.getElementById('galleryModal').style.display = 'none';
    currentImage = null;
}

// いいねをトグル
function toggleLike() {
    if (!currentImage) return;
    
    currentImage.isLiked = !currentImage.isLiked;
    if (currentImage.isLiked) {
        currentImage.likes++;
    } else {
        currentImage.likes--;
    }
    
    // モーダルのボタンを更新
    const likeBtn = document.getElementById('modalLikeBtn');
    likeBtn.classList.toggle('active', currentImage.isLiked);
    likeBtn.innerHTML = `❤️ ${currentImage.likes}`;
    
    // ギャラリーのボタンも更新
    const galleryLikeBtn = document.querySelector(`[data-id="${currentImage.id}"] .like`);
    if (galleryLikeBtn) {
        galleryLikeBtn.classList.toggle('active', currentImage.isLiked);
        galleryLikeBtn.innerHTML = `❤️ ${currentImage.likes}`;
    }
    
    // 統計も更新
    const statsElement = document.querySelector(`[data-id="${currentImage.id}"] .gallery-item-stats span`);
    if (statsElement) {
        statsElement.textContent = `❤️ ${currentImage.likes}`;
    }
}

// ノミネートをトグル
function toggleNominate() {
    if (!currentImage) return;
    
    currentImage.isNominated = !currentImage.isNominated;
    
    // モーダルのボタンを更新
    const nominateBtn = document.getElementById('modalNominateBtn');
    nominateBtn.classList.toggle('active', currentImage.isNominated);
    
    // ギャラリーのボタンも更新
    const galleryNominateBtn = document.querySelector(`[data-id="${currentImage.id}"] .nominate`);
    if (galleryNominateBtn) {
        galleryNominateBtn.classList.toggle('active', currentImage.isNominated);
    }
}

// ギャラリーからいいねをトグル
function toggleLikeFromGallery(event, itemId) {
    event.stopPropagation();
    
    const item = submissionData.find(i => i.id === itemId);
    if (!item) return;
    
    item.isLiked = !item.isLiked;
    if (item.isLiked) {
        item.likes++;
    } else {
        item.likes--;
    }
    
    // ボタンを更新
    const btn = event.target;
    btn.classList.toggle('active', item.isLiked);
    btn.innerHTML = `❤️ ${item.likes}`;
    
    // 統計も更新
    const statsElement = btn.closest('.gallery-item').querySelector('.gallery-item-stats span');
    if (statsElement) {
        statsElement.textContent = `❤️ ${item.likes}`;
    }
}

// ギャラリーからノミネートをトグル
function toggleNominateFromGallery(event, itemId) {
    event.stopPropagation();
    
    const item = submissionData.find(i => i.id === itemId);
    if (!item) return;
    
    item.isNominated = !item.isNominated;
    
    // ボタンを更新
    const btn = event.target;
    btn.classList.toggle('active', item.isNominated);
}

// 日付フォーマット
function formatDate(dateString) {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
}

// キーボードイベント
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeGalleryModal();
    }
});

// ページ読み込み完了後にアニメーションを初期化
window.addEventListener('load', function() {
    initScrollAnimations();
});

// メッセージ用のCSSを動的に追加
const messageStyles = `
    .success-message, .error-message {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    }
    
    .message-content {
        background: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 15px;
    }
    
    .success-message .message-content {
        border-left: 4px solid #48bb78;
    }
    
    .error-message .message-content {
        border-left: 4px solid #e53e3e;
    }
    
    .success-message i {
        color: #48bb78;
        font-size: 1.5rem;
    }
    
    .error-message i {
        color: #e53e3e;
        font-size: 1.5rem;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;

// スタイルを追加
const styleSheet = document.createElement('style');
styleSheet.textContent = messageStyles;
document.head.appendChild(styleSheet);

// バーとマイルストーンのテキストオーバーフロー制御を初期化
function initGanttTextOverflow() {
    const tracks = document.querySelectorAll('.track');
    
    tracks.forEach(track => {
        const month = Number(track.dataset.month || (new Date().getMonth() + 1));
        const days = Number(getComputedStyle(track).getPropertyValue('--days')) || 31;

        // --- 応募期間バー ---
        track.querySelectorAll('.bar[data-start][data-end]').forEach(bar => {
            const s = Number(bar.dataset.start);
            const e = Number(bar.dataset.end);
            const rangeText = `${month}/${s}–${month}/${e}`;

            // すでに分解されていなければ、テキストを span に移行
            if (!bar.querySelector('.bar-label')) {
                const raw = (bar.textContent || '').trim();
                bar.textContent = '';
                
                const label = document.createElement('span');
                label.className = 'bar-label';
                label.textContent = raw || '応募期間';

                const range = document.createElement('span');
                range.className = 'bar-range';
                range.textContent = rangeText;

                bar.append(label, range);
            } else {
                const range = bar.querySelector('.bar-range');
                if (range) range.textContent = rangeText;
            }
        });

        // --- 結果発表ピル：省略時に hover で全文表示できるよう title 付与 ---
        track.querySelectorAll('.milestone').forEach(ms => {
            const txt = (ms.textContent || '').trim();
            if (!ms.getAttribute('title') && txt) {
                ms.setAttribute('title', txt);
            }
            
            // すべて吹き出し化したい場合は以下を有効化
            // ms.classList.add('milestone--bubble');
        });
    });
}

// ガントチャートのホバー機能を初期化
function initGanttHover() {
    const tracks = document.querySelectorAll('.track');
    
    tracks.forEach(track => {
        const year = Number(track.dataset.year || new Date().getFullYear());
        const month = Number(track.dataset.month || (new Date().getMonth() + 1));
        const days = Number(getComputedStyle(track).getPropertyValue('--days')) || 31;

        // ホバー要素を取得または作成
        let hoverline = track.querySelector('.hoverline');
        let tooltip = track.querySelector('.tooltip');
        
        if (!hoverline) {
            hoverline = document.createElement('div');
            hoverline.className = 'hoverline';
            hoverline.setAttribute('aria-hidden', 'true');
            track.appendChild(hoverline);
        }
        
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.setAttribute('aria-hidden', 'true');
            track.appendChild(tooltip);
        }

        // 位置計算用のキャッシュ（パディング考慮）
        const rectCache = { left: 0, width: 0, padL: 0, padR: 0 };
        
        const updateRect = () => {
            const r = track.getBoundingClientRect();
            const cs = getComputedStyle(track);
            rectCache.padL = parseFloat(cs.paddingLeft || '0') || 0;
            rectCache.padR = parseFloat(cs.paddingRight || '0') || 0;
            rectCache.left = r.left + rectCache.padL;                 // 内容領域の左端
            rectCache.width = r.width - rectCache.padL - rectCache.padR; // 内容幅
        };
        
        updateRect();
        window.addEventListener('resize', updateRect);

        // マウス位置から日付を計算（内容幅基準）
        function dayFromX(clientX) {
            const x = Math.min(Math.max(clientX - rectCache.left, 0), rectCache.width);
            const ratio = x / rectCache.width;
            // 切り上げ・切り下げ調整：境界中心にスナップさせたいので +0.5 で丸め
            const d = Math.round(ratio * days + 0.5);
            return Math.max(1, Math.min(days, d));
        }
        
        function label(d) {
            return `${month}/${d}`;
        }

        // マウス移動イベント
        track.addEventListener('mousemove', (e) => {
            const d = dayFromX(e.clientX);
            const left = (rectCache.width * (d - 0.5) / days) + rectCache.padL; // 中央に合わせる
            
            if (hoverline) {
                hoverline.style.left = `${left}px`;
            }
            
            if (tooltip) {
                tooltip.style.left = `${left}px`;
                tooltip.textContent = label(d);
            }
        });
    });
}

// 開催予定コンテストの機能
async function initUpcomingContests() {
    const contestsGrid = document.getElementById('contestsGrid');
    if (!contestsGrid) {
        console.error('contestsGrid要素が見つかりません');
        return;
    }
    
    try {
        // コンテストデータを読み込み
        const response = await fetch('data/contests.json');
        const data = await response.json();
        console.log('コンテストデータを読み込みました:', data);
        
        // コンテストカードを生成
        data.contests.forEach(contest => {
            const contestCard = createUpcomingContestCard(contest);
            contestsGrid.appendChild(contestCard);
            console.log('コンテストカードを生成しました:', contest.id);
        });
    } catch (error) {
        console.error('コンテストデータの読み込みに失敗しました:', error);
    }
}

// 開催予定コンテストカードの作成
function createUpcomingContestCard(contest) {
    const card = document.createElement('div');
    card.className = 'contest-card';
    card.setAttribute('data-contest-id', contest.id);
    
    const startDate = new Date(contest.startDate).toLocaleDateString('ja-JP');
    const endDate = new Date(contest.endDate).toLocaleDateString('ja-JP');
    
    card.innerHTML = `
        <div class="contest-thumb">
            <img src="${contest.image}" alt="${contest.title}" onerror="this.src='assets/images/contests/default-contest.jpg'">
            <span class="badge">
                ${contest.status === 'upcoming' ? '開催予定' : contest.status === 'active' ? '開催中' : '終了'}
            </span>
        </div>
        <div class="contest-body">
            <h3 class="contest-title">${contest.title}</h3>
            <p class="contest-desc">${contest.subtitle}</p>
        </div>
    `;
    
    // カード全体のクリックイベント
    card.addEventListener('click', (e) => {
        e.preventDefault();
        const contestId = contest.id; // 直接contest.idを使用
        console.log('コンテスト詳細を開く:', contest.title);
        console.log('遷移先URL:', `contest-detail.html?id=${contestId}`);
        window.location.href = `contest-detail.html?id=${contestId}`;
    });
    
    
    return card;
}
