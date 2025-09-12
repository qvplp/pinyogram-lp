// 画像URLの一元設定。Cloudflare Imagesにアップロード後、以下を配信URLに差し替えてください。
window.APP_IMAGE = {
  hero: 'https://placehold.co/1920x1080/png?text=Pinyogram',
  event: 'https://placehold.co/800x600/png?text=Event',
  contestHero: 'https://placehold.co/1920x820/png?text=Contest'
};

// Cloudflare（R2/Pagesなど）の公開CDN基点URLを設定してください。
// 実際のCloudflare配信URLに設定
// 注意: 実際のCloudflare配信URLに変更してください
window.CDN_EVENTS_BASE = window.CDN_EVENTS_BASE || 'https://pinyogram.com/pinyogramlp/events';

// デバッグ用: 現在の設定をコンソールに表示
console.log('🔧 CDN Configuration:', {
  CDN_EVENTS_BASE: window.CDN_EVENTS_BASE,
  timestamp: new Date().toISOString()
});

// イベント用の画像URLを生成するヘルパー
// subdir: 'main' | 'models' など
// fileName: 例 'hero.jpg', 'card.jpg', '1.jpg'
window.getEventAssetUrl = function(eventSlug, subdir, fileName){
  // フォルダ名に "/" を含むケースを許容するため encodeURI を使用（スラッシュは保持）
  const encSlug = encodeURI(eventSlug);
  const url = `${window.CDN_EVENTS_BASE}/${encSlug}/${subdir}/${fileName}`;
  
  // デバッグログを追加
  console.log('🔗 Generated URL:', {
    eventSlug,
    subdir,
    fileName,
    encSlug,
    baseUrl: window.CDN_EVENTS_BASE,
    finalUrl: url
  });
  
  return url;
};

// 拡張子フォールバック用：baseName と拡張子候補からURL配列を生成
window.getEventAssetUrlCandidates = function(eventSlug, subdir, baseName, extensions){
  const exts = extensions && extensions.length ? extensions : ['jpg','png','webp'];
  return exts.map(ext => window.getEventAssetUrl(eventSlug, subdir, `${baseName}.${ext}`));
};

// 画像読み込みフォールバック: data-fallbacks に保存されたURLを順番に試す
window.__imgFallback = function(imgEl){
  try {
    const currentSrc = imgEl.src;
    const list = imgEl.getAttribute('data-fallbacks') || '';
    const arr = list.split(',').filter(Boolean);
    
    console.log('🔄 Image fallback triggered:', {
      currentSrc,
      fallbacks: arr,
      alt: imgEl.alt
    });
    
    if (arr.length === 0) {
      // フォールバック候補がない場合はプレースホルダーを表示
      console.log('❌ No fallback URLs available, showing placeholder');
      showPlaceholderImage(imgEl);
      return;
    }
    const next = arr.shift();
    imgEl.setAttribute('data-fallbacks', arr.join(','));
    console.log('🔄 Trying next URL:', next);
    imgEl.src = next;
  } catch (e) {
    console.error('❌ Fallback error:', e);
    showPlaceholderImage(imgEl);
  }
};

// プレースホルダー画像を表示する関数
function showPlaceholderImage(imgEl) {
  const alt = imgEl.alt || '画像';
  const isModel = imgEl.classList.contains('model-image');
  const isHero = imgEl.classList.contains('main-image');
  
  console.log('🎨 Showing placeholder for:', {
    alt,
    isModel,
    isHero,
    src: imgEl.src
  });
  
  if (isModel) {
    // モデル画像のプレースホルダー
    imgEl.style.display = 'none';
    const placeholder = document.createElement('div');
    placeholder.className = 'model-placeholder';
    placeholder.style.cssText = `
      width: 100%;
      height: 250px;
      background: linear-gradient(135deg, #ff6ec7, #3b82f6);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 48px;
      border-radius: 10px;
    `;
    placeholder.innerHTML = '👤';
    imgEl.parentNode.insertBefore(placeholder, imgEl);
  } else if (isHero) {
    // ヒーロー画像のプレースホルダー
    imgEl.style.display = 'none';
    const placeholder = document.createElement('div');
    placeholder.className = 'hero-placeholder';
    placeholder.style.cssText = `
      width: 100%;
      height: 400px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 48px;
    `;
    placeholder.innerHTML = '<div>📸</div><div style="font-size: 14px; margin-top: 10px;">画像を準備中です</div>';
    imgEl.parentNode.insertBefore(placeholder, imgEl);
  } else {
    // その他の画像のプレースホルダー
    imgEl.style.display = 'none';
    const placeholder = document.createElement('div');
    placeholder.className = 'card-placeholder';
    placeholder.style.cssText = `
      width: 100%;
      height: 200px;
      background: linear-gradient(135deg, #ff6ec7, #3b82f6);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
    `;
    placeholder.innerHTML = '📷';
    imgEl.parentNode.insertBefore(placeholder, imgEl);
  }
}

// 画像読み込みの即座フォールバック機能
window.setupImageFallback = function(imgEl) {
  // 画像読み込み開始時に即座にフォールバックを設定
  imgEl.addEventListener('load', function() {
    console.log('✅ Image loaded successfully:', this.src);
    // プレースホルダーを削除
    const placeholder = this.parentNode.querySelector('.model-placeholder, .hero-placeholder, .card-placeholder');
    if (placeholder) {
      placeholder.remove();
    }
  });
  
  imgEl.addEventListener('error', function() {
    console.log('❌ Image failed to load:', this.src);
    window.__imgFallback(this);
  });
  
  // タイムアウト設定（3秒でフォールバック）
  setTimeout(() => {
    if (!imgEl.complete || imgEl.naturalHeight === 0) {
      console.log('⏰ Image load timeout, showing placeholder');
      window.__imgFallback(imgEl);
    }
  }, 3000);
};
