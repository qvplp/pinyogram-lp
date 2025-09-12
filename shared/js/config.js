// 画像URLの一元設定。Cloudflare Imagesにアップロード後、以下を配信URLに差し替えてください。
window.APP_IMAGE = {
  hero: 'https://placehold.co/1920x1080/png?text=Pinyogram',
  event: 'https://placehold.co/800x600/png?text=Event',
  contestHero: 'https://placehold.co/1920x820/png?text=Contest'
};

// Cloudflare（R2/Pagesなど）の公開CDN基点URLを設定してください。
// 実際のCloudflare配信URLに設定
window.CDN_EVENTS_BASE = window.CDN_EVENTS_BASE || 'https://pinyogram.com/pinyogramlp/events';

// イベント用の画像URLを生成するヘルパー
// subdir: 'main' | 'models' など
// fileName: 例 'hero.jpg', 'card.jpg', '1.jpg'
window.getEventAssetUrl = function(eventSlug, subdir, fileName){
  // フォルダ名に "/" を含むケースを許容するため encodeURI を使用（スラッシュは保持）
  const encSlug = encodeURI(eventSlug);
  return `${window.CDN_EVENTS_BASE}/${encSlug}/${subdir}/${fileName}`;
};

// 拡張子フォールバック用：baseName と拡張子候補からURL配列を生成
window.getEventAssetUrlCandidates = function(eventSlug, subdir, baseName, extensions){
  const exts = extensions && extensions.length ? extensions : ['jpg','png','webp'];
  return exts.map(ext => window.getEventAssetUrl(eventSlug, subdir, `${baseName}.${ext}`));
};

// 画像読み込みフォールバック: data-fallbacks に保存されたURLを順番に試す
window.__imgFallback = function(imgEl){
  try {
    const list = imgEl.getAttribute('data-fallbacks') || '';
    const arr = list.split(',').filter(Boolean);
    if (arr.length === 0) {
      // フォールバック候補がない場合はプレースホルダーを表示
      showPlaceholderImage(imgEl);
      return;
    }
    const next = arr.shift();
    imgEl.setAttribute('data-fallbacks', arr.join(','));
    imgEl.src = next;
  } catch (e) {
    showPlaceholderImage(imgEl);
  }
};

// プレースホルダー画像を表示する関数
function showPlaceholderImage(imgEl) {
  const alt = imgEl.alt || '画像';
  const isModel = imgEl.classList.contains('model-image');
  const isHero = imgEl.classList.contains('main-image');
  
  if (isModel) {
    // モデル画像のプレースホルダー
    imgEl.style.display = 'none';
    const placeholder = document.createElement('div');
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
