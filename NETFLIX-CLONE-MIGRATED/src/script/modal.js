document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.dropdown > .icon-btn').forEach(btn => {
    const wrap   = btn.closest('.dropdown');
    const panel  = wrap.querySelector('.dropdown-panel');

    // 클릭 토글 (모바일/키보드)
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = wrap.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // 패널 내부 클릭은 유지
    panel.addEventListener('click', e => e.stopPropagation());
  });

  // 바깥 클릭 시 닫기
  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown.open').forEach(wrap => {
      wrap.classList.remove('open');
      const btn = wrap.querySelector('.icon-btn');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  });

  // ESC 닫기
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.dropdown.open').forEach(wrap => {
        wrap.classList.remove('open');
        const btn = wrap.querySelector('.icon-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    }
  });
});
