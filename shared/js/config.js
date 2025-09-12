// 画像URLの一元設定。Cloudflare Imagesにアップロード後、以下を配信URLに差し替えてください。
window.APP_IMAGE = {
  hero: 'https://placehold.co/1920x1080/png?text=Pinyogram',
  event: 'https://placehold.co/800x600/png?text=Event',
  contestHero: 'https://placehold.co/1920x820/png?text=Contest'
};

// Cloudflare（R2/Pagesなど）の公開CDN基点URLを設定してください。
// 例: 'https://cdn.example.com/pinyogramlp/events'
window.CDN_EVENTS_BASE = window.CDN_EVENTS_BASE || 'https://cdn.example.com/pinyogramlp/events';

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
      imgEl.style.display = 'none';
      return;
    }
    const next = arr.shift();
    imgEl.setAttribute('data-fallbacks', arr.join(','));
    imgEl.src = next;
  } catch (e) {
    imgEl.style.display = 'none';
  }
};
