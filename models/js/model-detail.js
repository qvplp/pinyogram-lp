/* ===================================
   モデル詳細ページ JavaScript - シンプル版
   =================================== */

// グローバル変数
let currentModel = null;
let allEvents = [];
let currentPhotoIndex = 0;
let galleryPhotos = [];

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', async function() {
    console.log('ページ読み込み開始');
    
    try {
        // URLパラメータからモデルIDと写真IDを取得
        const urlParams = new URLSearchParams(window.location.search);
        const modelId = urlParams.get('id');
        const photoId = urlParams.get('photo');
        
        console.log('モデルID:', modelId);
        console.log('写真ID:', photoId);
        
        if (!modelId) {
            console.error('モデルIDが指定されていません');
            showError('モデルIDが指定されていません');
            return;
        }
        
        // データの読み込み
        console.log('データ読み込み開始');
        const [modelsData, eventsData] = await Promise.all([
            fetch('/models/data/models.json?v=' + Date.now()).then(r => {
                console.log('models.json レスポンス:', r.status);
                return r.json();
            }),
            fetch('/data/events.json?v=' + Date.now()).then(r => {
                console.log('events.json レスポンス:', r.status);
                return r.json();
            })
        ]);
        
        console.log('読み込んだモデルデータ:', modelsData);
        console.log('読み込んだイベントデータ:', eventsData);
        
        // モデルを検索
        currentModel = modelsData.models.find(m => m.model_id === modelId);
        allEvents = eventsData.events || [];
        
        if (!currentModel) {
            console.error('モデルが見つかりません:', modelId);
            showError('モデルが見つかりません');
            return;
        }
        
        console.log('現在のモデル:', currentModel);
        
        // ページの描画
        renderProfile();
        renderGallery();
        renderEvents();
        updateOGP();
        
        // History API でURL書き換え
        if (photoId) {
            const newUrl = `/models/${modelId}/${photoId}`;
            window.history.replaceState({modelId, photoId}, '', newUrl);
            highlightPhoto(photoId);
        } else {
            const newUrl = `/models/${modelId}`;
            window.history.replaceState({modelId}, '', newUrl);
        }
        
        // ライトボックスの初期化
        initLightbox();
        
        console.log('ページ読み込み完了');
        
    } catch (error) {
        console.error('エラー発生:', error);
        showError('データの読み込みに失敗しました: ' + error.message);
    }
});

// プロフィール情報の描画
function renderProfile() {
    console.log('プロフィール描画開始');
    
    // パンくずリスト
    const breadcrumbElement = document.getElementById('breadcrumb-model-name');
    if (breadcrumbElement) {
        breadcrumbElement.textContent = currentModel.name;
    }
    
    // プロフィール画像
    const profileImage = document.getElementById('profile-image');
    if (profileImage) {
        profileImage.src = currentModel.profile_image;
        profileImage.alt = currentModel.name;
    }
    
    // モデル名
    const modelNameElement = document.getElementById('model-name');
    if (modelNameElement) {
        modelNameElement.textContent = currentModel.name;
    }
    
    // モデルからのコメント（条件付き表示）
    if (currentModel.model_comment && currentModel.model_comment.trim() !== '') {
        const commentContainer = document.getElementById('model-comment-container');
        const commentElement = document.getElementById('model-comment');
        if (commentContainer && commentElement) {
            commentContainer.style.display = 'block';
            commentElement.innerHTML = currentModel.model_comment.replace(/\n/g, '<br>');
        }
    }
    
    // SNSリンク
    renderSNS();
    
    // アップロードボタンのテキスト更新
    const uploadButtonText = document.getElementById('upload-button-text');
    if (uploadButtonText) {
        uploadButtonText.textContent = `${currentModel.name}の画像を投稿する`;
    }
    
    console.log('プロフィール描画完了');
}

// SNSリンクの描画
function renderSNS() {
    const snsContainer = document.getElementById('sns-links');
    if (!snsContainer) return;
    
    snsContainer.innerHTML = '';
    
    // Twitter
    if (currentModel.sns.twitter && currentModel.sns.twitter.trim() !== '') {
        const twitterLink = document.createElement('a');
        twitterLink.href = currentModel.sns.twitter;
        twitterLink.className = 'sns-link';
        twitterLink.target = '_blank';
        twitterLink.rel = 'noopener noreferrer';
        twitterLink.innerHTML = '<i class="fab fa-x-twitter"></i>';
        snsContainer.appendChild(twitterLink);
    }
    
    // Instagram
    if (currentModel.sns.instagram && currentModel.sns.instagram.trim() !== '') {
        const instagramLink = document.createElement('a');
        instagramLink.href = currentModel.sns.instagram;
        instagramLink.className = 'sns-link';
        instagramLink.target = '_blank';
        instagramLink.rel = 'noopener noreferrer';
        instagramLink.innerHTML = '<i class="fab fa-instagram"></i>';
        snsContainer.appendChild(instagramLink);
    }
}

// ギャラリーの描画
function renderGallery() {
    console.log('ギャラリー描画開始');
    
    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) return;
    
    galleryGrid.innerHTML = '';
    galleryPhotos = currentModel.gallery || [];
    
    if (galleryPhotos.length === 0) {
        galleryGrid.innerHTML = '<p class="no-data">ギャラリー画像はまだありません</p>';
        return;
    }
    
    galleryPhotos.forEach((photo, index) => {
        const photoCard = document.createElement('div');
        photoCard.className = 'gallery-item';
        photoCard.dataset.photoId = photo.id;
        
        // タイトルと説明文は表示しない
        photoCard.innerHTML = `
            <img src="${photo.url}" alt="${currentModel.name}" loading="lazy">
            <button class="share-button" data-photo-id="${photo.id}">
                <i class="fas fa-share-alt"></i>
            </button>
        `;
        
        // 画像クリックでライトボックス
        photoCard.querySelector('img').addEventListener('click', () => {
            openLightbox(index);
        });
        
        // 共有ボタンのクリックイベント
        photoCard.querySelector('.share-button').addEventListener('click', (e) => {
            e.stopPropagation(); // 画像クリックイベントを防ぐ
            copyPhotoUrl(photo.id, e.target.closest('.share-button'));
        });
        
        galleryGrid.appendChild(photoCard);
    });
    
    console.log('ギャラリー描画完了');
}

// 出演イベントの描画
function renderEvents() {
    console.log('イベント描画開始');
    
    const eventsGrid = document.getElementById('events-grid');
    if (!eventsGrid) return;
    
    eventsGrid.innerHTML = '';
    
    const upcomingEventIds = currentModel.upcoming_events || [];
    
    if (upcomingEventIds.length === 0) {
        eventsGrid.innerHTML = '<p class="no-data">現在、出演予定のイベントはありません</p>';
        return;
    }
    
    // 現在の日付を取得（時刻を00:00:00に設定）
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 未来のイベントのみをフィルタリング
    const futureEvents = upcomingEventIds.filter(eventId => {
        const event = allEvents.find(e => e.event_id === eventId);
        if (!event) return false;
        
        const eventDate = new Date(event.event_date);
        eventDate.setHours(0, 0, 0, 0);
        
        return eventDate >= today;
    });
    
    if (futureEvents.length === 0) {
        eventsGrid.innerHTML = '<p class="no-data">現在、出演予定のイベントはありません</p>';
        return;
    }
    
    futureEvents.forEach(eventId => {
        const event = allEvents.find(e => e.event_id === eventId);
        if (!event) return;
        
        const eventCard = document.createElement('a');
        eventCard.href = `/event/event-detail.html?id=${event.event_id}`;
        eventCard.className = 'event-card';
        
        const eventDate = new Date(event.event_date);
        const formattedDate = eventDate.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // バナー画像のURLを生成
        let bannerImageUrl = '';
        if (event.thumbnail_image && event.thumbnail_image.startsWith('http')) {
            bannerImageUrl = event.thumbnail_image;
        } else {
            // フォールバック画像
            bannerImageUrl = '/assets/images/common/placeholder.jpg';
        }
        
        // バッジの生成
        let badgeHtml = '';
        if (event.is_limited) {
            badgeHtml = '<div class="event-badge badge-limited">限定</div>';
        }
        
        eventCard.innerHTML = `
            <figure class="media-frame is-40x21 fill-gradient" data-focal="center" style="--bg: url('${bannerImageUrl}')">
                <img src="${bannerImageUrl}" alt="${event.event_name}の画像" loading="lazy" decoding="async" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'color: white; text-align: center; padding: 20px;\\'>📷<br/>画像読み込み中...</div>'">
                <div class="media-overlay">
                    ${badgeHtml}
                </div>
            </figure>
            <div class="event-content">
                <h3 class="event-title">${event.event_name}</h3>
                <div class="event-info">📅 ${formattedDate}</div>
                <div class="event-info">📍 ${event.venue.venue_name}</div>
            </div>
            <div class="event-footer">
                <span class="event-price">¥${event.pricing ? event.pricing.perUnit.toLocaleString() : '10,000'}</span>
                <span style="color: #666; font-size: 0.85rem;">
                    ${event.remaining_slots ? `残り${event.remaining_slots}枠` : '空きあり'}
                </span>
            </div>
        `;
        
        eventsGrid.appendChild(eventCard);
    });
    
    console.log(`イベント描画完了 - 表示イベント数: ${futureEvents.length}`);
}

// OGPメタタグの更新
function updateOGP() {
    const urlParams = new URLSearchParams(window.location.search);
    const photoId = urlParams.get('photo');
    
    let ogImage = currentModel.profile_image;
    let ogTitle = `${currentModel.name}のギャラリー | ぴにょぐらむ撮影会`;
    
    if (photoId) {
        const photo = galleryPhotos.find(p => p.id === photoId);
        if (photo) {
            ogImage = photo.url;
        }
    }
    
    const ogImageMeta = document.querySelector('meta[property="og:image"]');
    const ogTitleMeta = document.querySelector('meta[property="og:title"]');
    const twitterImageMeta = document.querySelector('meta[name="twitter:image"]');
    const twitterTitleMeta = document.querySelector('meta[name="twitter:title"]');
    
    if (ogImageMeta) ogImageMeta.setAttribute('content', ogImage);
    if (ogTitleMeta) ogTitleMeta.setAttribute('content', ogTitle);
    if (twitterImageMeta) twitterImageMeta.setAttribute('content', ogImage);
    if (twitterTitleMeta) twitterTitleMeta.setAttribute('content', ogTitle);
    
    document.title = ogTitle;
}

// URLコピー機能（改善版）
async function copyPhotoUrl(photoId, buttonElement) {
    const url = `${window.location.origin}/models/${currentModel.model_id}/${photoId}`;
    
    try {
        await navigator.clipboard.writeText(url);
        
        // ボタンの表示を変更
        if (buttonElement) {
            buttonElement.classList.add('copied');
            const originalIcon = buttonElement.innerHTML;
            buttonElement.innerHTML = '<i class="fas fa-check"></i>';
            
            setTimeout(() => {
                buttonElement.classList.remove('copied');
                buttonElement.innerHTML = originalIcon;
            }, 1500);
        }
        
        console.log('URLをコピーしました:', url);
    } catch (error) {
        console.error('コピー失敗:', error);
        alert('URLのコピーに失敗しました');
    }
}

// ライトボックスの初期化
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    const shareBtn = document.getElementById('lightbox-share');
    const lightboxImage = document.getElementById('lightbox-image');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeLightbox);
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', () => navigateLightbox(-1));
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => navigateLightbox(1));
    }
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            const currentPhoto = galleryPhotos[currentPhotoIndex];
            copyPhotoUrl(currentPhoto.id, shareBtn);
        });
    }
    
    // 画像クリックで次の画像に遷移
    if (lightboxImage) {
        lightboxImage.addEventListener('click', (e) => {
            e.stopPropagation();
            const rect = lightboxImage.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const imageCenter = rect.width / 2;
            
            if (clickX < imageCenter) {
                navigateLightbox(-1); // 左側クリックで前の画像
            } else {
                navigateLightbox(1); // 右側クリックで次の画像
            }
        });
    }
    
    // スワイプ機能の実装
    let startX = 0;
    let startY = 0;
    let isDragging = false;
    
    if (lightboxImage) {
        // タッチイベント（モバイル）
        lightboxImage.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isDragging = true;
        });
        
        lightboxImage.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
        });
        
        lightboxImage.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            // 水平方向のスワイプが垂直方向より大きい場合のみ処理
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    navigateLightbox(-1); // 右スワイプで前の画像
                } else {
                    navigateLightbox(1); // 左スワイプで次の画像
                }
            }
        });
        
        // マウスイベント（デスクトップ）
        lightboxImage.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            startY = e.clientY;
            isDragging = true;
            e.preventDefault();
        });
        
        lightboxImage.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
        });
        
        lightboxImage.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            isDragging = false;
            
            const endX = e.clientX;
            const endY = e.clientY;
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            // 水平方向のドラッグが垂直方向より大きい場合のみ処理
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    navigateLightbox(-1); // 右ドラッグで前の画像
                } else {
                    navigateLightbox(1); // 左ドラッグで次の画像
                }
            }
        });
        
        // マウスが離れた場合の処理
        lightboxImage.addEventListener('mouseleave', () => {
            isDragging = false;
        });
    }
    
    // 背景クリックで閉じる
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }
    
    // キーボード操作
    document.addEventListener('keydown', (e) => {
        if (!lightbox || !lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
    });
}

// ライトボックスを開く
function openLightbox(index) {
    currentPhotoIndex = index;
    const photo = galleryPhotos[index];
    
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxCounter = document.getElementById('lightbox-counter');
    const lightbox = document.getElementById('lightbox');
    
    if (lightboxImage) lightboxImage.src = photo.url;
    if (lightboxCounter) lightboxCounter.textContent = `${index + 1}/${galleryPhotos.length}`;
    if (lightbox) {
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// ライトボックスを閉じる
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ライトボックスのナビゲーション
function navigateLightbox(direction) {
    currentPhotoIndex += direction;
    
    if (currentPhotoIndex < 0) {
        currentPhotoIndex = galleryPhotos.length - 1;
    } else if (currentPhotoIndex >= galleryPhotos.length) {
        currentPhotoIndex = 0;
    }
    
    const photo = galleryPhotos[currentPhotoIndex];
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxCounter = document.getElementById('lightbox-counter');
    
    if (lightboxImage) lightboxImage.src = photo.url;
    if (lightboxCounter) lightboxCounter.textContent = `${currentPhotoIndex + 1}/${galleryPhotos.length}`;
}

// 写真のハイライト
function highlightPhoto(photoId) {
    setTimeout(() => {
        const photoElement = document.querySelector(`[data-photo-id="${photoId}"]`);
        if (photoElement) {
            photoElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            photoElement.classList.add('highlight-animation');
            
            setTimeout(() => {
                photoElement.classList.remove('highlight-animation');
            }, 3000);
        }
    }, 500);
}

// エラー表示
function showError(message) {
    const main = document.querySelector('.model-detail-page');
    if (main) {
        main.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
                <a href="/models/index.html" class="btn-back">モデル一覧に戻る</a>
            </div>
        `;
    }
}

// アップロードボタンのクリック処理
function handleUploadClick() {
    if (!currentModel) {
        alert('モデル情報が読み込まれていません');
        return;
    }
    
    // モデルごとのアップロードリンクを取得
    if (currentModel.upload_link) {
        // 新しいタブでリンクを開く
        window.open(currentModel.upload_link, '_blank');
    } else {
        // フォールバック: デフォルトのアップロードページまたはアラート
        alert(`${currentModel.name}の画像投稿機能は準備中です`);
    }
}

// グローバル関数として公開
window.handleUploadClick = handleUploadClick;