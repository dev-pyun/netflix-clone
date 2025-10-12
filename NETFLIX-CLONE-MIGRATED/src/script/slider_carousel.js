// src/script.js
// 무한 슬라이더 구현
// - HTML 구조: .slider > .slider-content > (.prev-button, .next-button, .slider-container > .slider-item*)
(function () {
  const SCROLL_SETTLE_MS = 120; // 스크롤 안정화 대기
  const CARDS_PER_STEP = 3;     
  
  function debounce(fn, ms=120){ let t; return (...a)=>{clearTimeout(t); t=setTimeout(()=>fn(...a),ms);} }
  
  function initInfiniteSlider(sliderEl) {
    const container = sliderEl.querySelector('.slider-container');
    const prevBtn   = sliderEl.querySelector('.prev-button');
    const nextBtn   = sliderEl.querySelector('.next-button');
    if (!container || !prevBtn || !nextBtn) return;
    
    // 이미 초기화된 슬라이더는 패스
    if (container.dataset.infinite === 'on') return;
    container.dataset.infinite = 'on';
    
    // 1) 초기 목록과 클론 구성
    let items = Array.from(container.querySelectorAll('.slider-item'));
    const style = getComputedStyle(container);
    const gapPx = parseFloat(style.columnGap || style.gap || '8') || 8;

    // 화면에 보이는 카드 수 추정(N) → 앞뒤로 N개씩 클론
    const N = 8;
    const headClones = items.slice(-N).map(cloneItem);
    const tailClones = items.slice(0, N).map(cloneItem);
    headClones.reverse(); // append 순서 보정
    headClones.forEach(c => container.insertBefore(c, container.firstChild));
    tailClones.forEach(c => container.appendChild(c));

    items = Array.from(container.querySelectorAll('.slider-item')); // 클론 포함 전체
    const total = items.length;
    const ORIGINAL_LEN = total - 2*N;

    // 2) 시작 위치: 클론 뒤 첫 원본으로
    function jumpToIndex(i, smooth = false) {
      const t = items[i];
      if (!t) return;

      if (smooth) {
        container.style.scrollBehavior = 'smooth';
        container.scrollTo({ left: t.offsetLeft, behavior: 'smooth' });
        return;
      }

      const prevSnap = container.style.scrollSnapType;
      const prevBehv = container.style.scrollBehavior;

      container.style.scrollSnapType = 'none';
      container.style.setProperty('scroll-behavior', 'auto', 'important');

      container.scrollLeft = t.offsetLeft;
      container.offsetHeight; // force reflow

      requestAnimationFrame(() => {
        container.style.scrollSnapType = prevSnap || '';
        container.style.scrollBehavior = prevBehv || 'smooth';
      });
    }
    jumpToIndex(N, false);

    // 3) index 기반으로 "정확히 3장씩" 이동
    let isAnimating = false; // ✅ 스무스 중엔 보정 금지
    function nearestIndex() {
      // offsetLeft가 scrollLeft에 가장 가까운 index (스냅 덕분에 거의 일치)
      let lo=0, hi=items.length-1, best=0, bestDiff=1e9, x0=container.scrollLeft;
      while (lo<=hi){ const mid=(lo+hi)>>1, x=items[mid].offsetLeft, d=Math.abs(x-x0);
        if(d<bestDiff){bestDiff=d; best=mid;}
        x<x0? lo=mid+1: hi=mid-1;
      }
      return best;
    }

    // 3) 페이지 인디케이터 관련 함수들
    function createPageIndicators() {
      const existingIndicator = sliderEl.querySelector('.page-indicators');
      if (existingIndicator) {
        existingIndicator.remove();
      }
      
      const visibleCards = estimateVisibleCount(container, items[N], gapPx);
      const totalPages = Math.ceil(ORIGINAL_LEN / CARDS_PER_STEP);
      
      if (totalPages <= 1) return null; // 페이지가 1개 이하면 인디케이터 불필요
      
      const indicatorContainer = document.createElement('div');
      indicatorContainer.className = 'page-indicators';
      indicatorContainer.style.cssText = `
        position: absolute;
        top: 32px;
        right: 16px;
        display: flex;
        gap: 8px;
        z-index: 10;
        transition: all 0.3s ease;
        border-radius: 20px;
        padding: 6px 10px;
      `;
      
      for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('div');
        dot.className = 'page-dot';
        dot.dataset.page = i;
        dot.style.cssText = `
          width: 12px;
          height: 3px;
          background-color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        `;
        
        dot.addEventListener('click', () => {
          const targetIndex = N + (i * CARDS_PER_STEP);
          isAnimating = true;
          jumpToIndex(targetIndex, true);
        });
        
        indicatorContainer.appendChild(dot);
      }
      
      sliderEl.style.position = 'relative';
      sliderEl.appendChild(indicatorContainer);
      
      return indicatorContainer;
    }
    
    function updateActiveIndicator() {
      const indicators = sliderEl.querySelectorAll('.page-dot');
      if (!indicators.length) return;
      
      const currentIndex = nearestIndex();
      let originalIndex = currentIndex;
      
      if (currentIndex < N) {
        originalIndex = currentIndex + ORIGINAL_LEN;
      } else if (currentIndex >= N + ORIGINAL_LEN) {
        originalIndex = currentIndex - ORIGINAL_LEN;
      }
      
      const relativeIndex = originalIndex - N;
      const currentPage = Math.floor(relativeIndex / CARDS_PER_STEP);
      
      indicators.forEach((dot, index) => {
        const isActive = index === currentPage;
        dot.style.backgroundColor = isActive 
          ? 'rgba(255, 255, 255, 0.9)' 
          : 'rgba(255, 255, 255, 0.4)';
        dot.style.transform = isActive ? 'scale(1.2)' : 'scale(1)';
        dot.style.borderColor = isActive ? 'rgba(255, 255, 255, 0.6)' : 'transparent';
      });
    }


    function moveByCards(dir) {
      const cur = nearestIndex();
      let target = cur + dir * CARDS_PER_STEP;
      // 범위를 벗어나도 일단 부드럽게 스크롤 → 끝나면 보정 로직이 처리

      const visibleCards = estimateVisibleCount(container, items[0], gapPx);

      // ✅ 핵심: 이동 후 화면에 보이는 영역이 "순수 원본" 또는 "순수 클론"만 포함하도록
      if (dir > 0) { // 오른쪽으로
        const lastVisible = target + visibleCards - 1;
        const originalEnd = N + ORIGINAL_LEN - 1;
        const cloneStart = N + ORIGINAL_LEN;
        
        // 원본과 클론이 섞여서 보이게 되는 상황이면 조정
        if (target <= originalEnd && lastVisible >= cloneStart) {
          // 클론영역 직전에서 멈춤
          target = cloneStart - visibleCards + 1;
        }
        if (target > originalEnd || cur >= originalEnd - visibleCards + 1) {
          // 완전히 클론 영역으로 이동
          target = cloneStart;
        }
      } else { // 왼쪽으로
        const lastVisible = target + visibleCards - 1;
        const originalStart = N;
        const cloneEnd = N - 1;
        
        // 원본과 클론이 섞여서 보이게 되는 상황이면 조정
        if (cur === originalStart && target < originalStart) {
          // 클론영역 직후에서 멈춤
          target = Math.max(0, cloneEnd - visibleCards + 1);
        } else if (target <= cloneEnd && lastVisible > originalStart) {
          // 클론영역 직전에서 멈춤
          target = originalStart;
        } 
      }
      
      // 전체 범위 내에서 제한
      target = Math.max(0, Math.min(items.length - visibleCards, target));

      isAnimating = true;                    // ✅ 애니메이션 시작
      jumpToIndex(target, true);
    }

    prevBtn.addEventListener('click', () => moveByCards(-1));
    nextBtn.addEventListener('click', () => moveByCards( 1));

    // 4) 스크롤 안정화 후에만 클론 보정
    const onScrollSettled = debounce(() => {
      if (isAnimating) {                     // 스무스가 끝났을 타이밍
        isAnimating = false;
      }
      const i = nearestIndex();

      // 왼쪽 클론(0 ~ N-1) → 동일 카드의 오른쪽 원본으로 점프
      if (i < N) {
        const originalI = i + ORIGINAL_LEN;  // 같은 카드의 원본 인덱스
        jumpToIndex(originalI, false);       // 순간 이동(스냅 유지)
        return;
      }
      // 오른쪽 클론(total-N ~ total-1) → 동일 카드의 왼쪽 원본으로 점프
      if (i >= total - N) {
        const originalI = i - ORIGINAL_LEN;
        jumpToIndex(originalI, false);
        return;
      }

      updateActiveIndicator();
    }, SCROLL_SETTLE_MS);

    container.addEventListener('scroll', onScrollSettled, { passive: true });

    // 초기화 - 여기가 핵심!
    createPageIndicators(); // 인디케이터 생성 호출
    updateActiveIndicator(); //초기 활성 상태 설정

    // --- helpers ---
    function cloneItem(node) { const c = node.cloneNode(true); c.dataset.clone='true'; return c; }
    function estimateVisibleCount(container, firstItem, gapPx){
      if(!firstItem) return 1;
      const w = firstItem.getBoundingClientRect().width;
      const cw = container.clientWidth;
      return Math.max(1, Math.floor((cw + gapPx) / (w + gapPx)));
    }
  }

  // CSS 스타일 추가
  if (!document.querySelector('#page-indicator-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'page-indicator-styles';
    styleElement.textContent = `
      .page-indicators {
        pointer-events: auto;
      }
      
      .page-dot:hover {
        background-color: rgba(255, 255, 255, 0.7) !important;
        transform: scale(1.1) !important;
      }
      
      .slider:hover .page-indicators {
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(8px);
      }
      
      @media (max-width: 768px) {
        .page-indicators {
          bottom: 8px !important;
          right: 8px !important;
          gap: 6px !important;
          padding: 4px 8px !important;
        }
        
        .page-dot {
          width: 8px !important;
          height: 8px !important;
        }
      }
    `;
    document.head.appendChild(styleElement);
  }

  // document.querySelectorAll('.slider').forEach(initInfiniteSlider);
  document.addEventListener('DOMContentLoaded', () => {
  // 콘텐츠 로딩 완료 후 슬라이더 초기화
  document.addEventListener('contentLoaded', () => {
    document.querySelectorAll('.slider').forEach(initInfiniteSlider);
    });
  });
})();