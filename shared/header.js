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

      // ハンバーガーメニューの機能を初期化
      initHamburgerMenu();

      // アクティブ表示：現在のパスに合う data-match を持つリンクに is-active
      const path = location.pathname;
      document.querySelectorAll('.main-nav a[data-match]').forEach(a=>{
        const m = a.getAttribute('data-match');
        if (m && path.indexOf(m) === 0) {
          a.classList.add('is-active');
          a.setAttribute('aria-current','page');
        }
      });

      // コンテストリンクの一時無効化とイベントページでの「Coming soon」表示
      const contestLink = document.querySelector('.main-nav a[href="/contest/contest.html"]');
      if (contestLink) {
        contestLink.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
        });
        contestLink.setAttribute('aria-disabled', 'true');
        contestLink.classList.add('is-disabled');
        contestLink.style.pointerEvents = 'none';
        contestLink.style.opacity = '0.6';
        contestLink.title = 'Coming soon';

        // イベントページのみ補助テキストを表示
        if (path.includes('/event/')) {
          const note = document.createElement('span');
          note.textContent = 'Coming soon';
          note.className = 'coming-soon-note';
          note.style.marginLeft = '8px';
          note.style.fontSize = '0.85rem';
          note.style.color = '#999';
          contestLink.insertAdjacentElement('afterend', note);
        }
      }
    })
    .catch(() => {
      mount.outerHTML = '<header class="site-header"><div class="header-inner"><a class="brand" href="/">ぴによぐらむ撮影会</a></div></header>';
    });

  // ハンバーガーメニューの機能
  function initHamburgerMenu() {
    const hamburgerButton = document.querySelector('.hamburger-menu');
    const mainNav = document.querySelector('.main-nav');
    
    if (!hamburgerButton || !mainNav) return;

    // ハンバーガーメニューボタンのクリックイベント
    hamburgerButton.addEventListener('click', () => {
      const isExpanded = hamburgerButton.getAttribute('aria-expanded') === 'true';
      
      // メニューの開閉状態を切り替え
      hamburgerButton.setAttribute('aria-expanded', !isExpanded);
      mainNav.classList.toggle('is-open');
      
      // ボディのスクロールを制御（メニューが開いている時はスクロール無効）
      document.body.style.overflow = !isExpanded ? 'hidden' : '';
    });

    // メニューリンクがクリックされた時にメニューを閉じる
    mainNav.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        hamburgerButton.setAttribute('aria-expanded', 'false');
        mainNav.classList.remove('is-open');
        document.body.style.overflow = '';
      }
    });

    // 画面サイズが変更された時の処理
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        // デスクトップサイズではメニューを閉じる
        hamburgerButton.setAttribute('aria-expanded', 'false');
        mainNav.classList.remove('is-open');
        document.body.style.overflow = '';
      }
    });

    // ESCキーでメニューを閉じる
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mainNav.classList.contains('is-open')) {
        hamburgerButton.setAttribute('aria-expanded', 'false');
        mainNav.classList.remove('is-open');
        document.body.style.overflow = '';
      }
    });
  }
})();
