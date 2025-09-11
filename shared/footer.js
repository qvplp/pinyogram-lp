(function(){
  const mount = document.getElementById('site-footer');
  if(!mount) return;

  const CSS = '/shared/footer.css';
  const HTML = '/shared/footer.html';

  // CSSは一度だけ
  if(!document.querySelector('link[data-shared-footer]')){
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = CSS;
    link.setAttribute('data-shared-footer','');
    document.head.appendChild(link);
  }

  fetch(HTML, {cache:'no-cache'})
    .then(r => r.ok ? r.text() : Promise.reject(r.status))
    .then(html => { mount.outerHTML = html; })
    .catch(() => {
      mount.outerHTML = '<footer class="site-footer"><div class="footer-bottom"><p>© 2024 ぴにょぐらむ撮影会</p></div></footer>';
    });
})();
