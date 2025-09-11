(function(){
  const mount = document.getElementById('site-header');
  if(!mount) return;

  // CSS を一度だけ読み込む
  if(!document.querySelector('link[data-shared-header]')){
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/shared/header.css';
    link.setAttribute('data-shared-header','');
    document.head.appendChild(link);
  }

  fetch('/shared/header.html', {cache:'no-cache'})
    .then(r => r.ok ? r.text() : Promise.reject(r.status))
    .then(html => {
      mount.outerHTML = html;

      // アクティブ表示：現在のパスに合う data-match を持つリンクに is-active
      const path = location.pathname;
      document.querySelectorAll('.main-nav a[data-match]').forEach(a=>{
        const m = a.getAttribute('data-match');
        if (m && path.indexOf(m) === 0) {
          a.classList.add('is-active');
          a.setAttribute('aria-current','page');
        }
      });
    })
    .catch(() => {
      mount.outerHTML = '<header class="site-header"><div class="header-inner"><a class="brand" href="/">ぴによぐらむ撮影会</a></div></header>';
    });
})();
