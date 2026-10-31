/**
 * GHAZAL BHATNAGAR — RESUME PREVIEW & SELECTION PORTAL
 * Interactive Controller Engine
 */

(function () {
  'use strict';

  // State
  let currentEdition = 'dark-luxury'; // 'dark-luxury' | 'warm-ivory'
  let currentZoom = 0.95;
  let isCompareMode = false;

  const EDITIONS = {
    'dark-luxury': {
      id: 'dark-luxury',
      name: 'Edition v2 — Dark Luxury & Antique Gold',
      shortName: 'Dark Luxury (v2)',
      src: 'editions/dark-luxury.html',
      badge: 'Deepika Aesthetic • Onyx & Antique Gold',
      themeBg: '#141414'
    },
    'warm-ivory': {
      id: 'warm-ivory',
      name: 'Edition v1 — Warm Ivory & Metallic Gold',
      shortName: 'Warm Ivory (v1)',
      src: 'editions/warm-ivory.html',
      badge: 'Executive Editorial • Ivory & Gold',
      themeBg: '#fdfbf7'
    }
  };

  // DOM Elements
  const previewStage = document.getElementById('previewStage');
  const mainIframeCard = document.getElementById('mainIframeCard');
  const mainIframe = document.getElementById('mainIframe');
  const compareIframeCard = document.getElementById('compareIframeCard');
  const compareIframe = document.getElementById('compareIframe');
  const zoomDisplay = document.getElementById('zoomDisplay');
  const activeEditionBadge = document.getElementById('activeEditionBadge');
  const mainIframeTitle = document.getElementById('mainIframeTitle');
  const btnDarkLuxury = document.getElementById('btnDarkLuxury');
  const btnWarmIvory = document.getElementById('btnWarmIvory');
  const btnCompare = document.getElementById('btnCompare');
  const btnPrint = document.getElementById('btnPrint');
  const btnOpenStandalone = document.getElementById('btnOpenStandalone');
  const pagePills = document.querySelectorAll('.page-pill');

  // Initialize
  function init() {
    calculateInitialZoom();
    applyZoom();
    setupEventListeners();
    setEdition('dark-luxury');
  }

  // Auto-calculate optimal zoom based on screen width
  function calculateInitialZoom() {
    const viewportWidth = window.innerWidth;
    if (viewportWidth < 600) {
      currentZoom = 0.42;
    } else if (viewportWidth < 900) {
      currentZoom = 0.65;
    } else if (viewportWidth < 1200) {
      currentZoom = 0.82;
    } else if (viewportWidth < 1600) {
      currentZoom = 0.92;
    } else {
      currentZoom = 1.0;
    }
  }

  // Switch Edition
  function setEdition(editionId) {
    if (!EDITIONS[editionId]) return;
    currentEdition = editionId;
    const edition = EDITIONS[editionId];

    // Update Buttons
    if (editionId === 'dark-luxury') {
      btnDarkLuxury.classList.add('active');
      btnWarmIvory.classList.remove('active');
    } else {
      btnDarkLuxury.classList.remove('active');
      btnWarmIvory.classList.add('active');
    }

    // Update Header Badges
    if (activeEditionBadge) {
      activeEditionBadge.textContent = edition.badge;
    }
    if (mainIframeTitle) {
      mainIframeTitle.textContent = edition.name;
    }

    // Load iframe
    mainIframe.classList.add('loading');
    mainIframe.src = edition.src;
    mainIframe.style.backgroundColor = edition.themeBg;

    // Update standalone link
    if (btnOpenStandalone) {
      btnOpenStandalone.href = edition.src;
    }
  }

  mainIframe.addEventListener('load', () => {
    mainIframe.classList.remove('loading');
    injectIframeStyles(mainIframe);
  });

  if (compareIframe) {
    compareIframe.addEventListener('load', () => {
      compareIframe.classList.remove('loading');
      injectIframeStyles(compareIframe);
    });
  }

  // Hide the interactive HUD inside the embedded resume iframes for clean view
  function injectIframeStyles(iframe) {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      if (doc) {
        const style = doc.createElement('style');
        style.textContent = `
          .hud-controls { display: none !important; }
          .screen-workspace { padding-top: 10px !important; }
        `;
        doc.head.appendChild(style);
      }
    } catch (e) {
      // Cross-origin fallback (when hosted on certain servers)
    }
  }

  // Zoom Handling
  function applyZoom() {
    previewStage.style.transform = `scale(${currentZoom})`;
    zoomDisplay.textContent = `${Math.round(currentZoom * 100)}%`;
  }

  function zoomIn() {
    currentZoom = Math.min(1.5, currentZoom + 0.1);
    applyZoom();
  }

  function zoomOut() {
    currentZoom = Math.max(0.35, currentZoom - 0.1);
    applyZoom();
  }

  function zoomActual() {
    currentZoom = 1.0;
    applyZoom();
  }

  function zoomFit() {
    calculateInitialZoom();
    applyZoom();
  }

  // Jump to specific page inside iframe
  function scrollToPage(pageNum) {
    try {
      const targetDoc = mainIframe.contentDocument || mainIframe.contentWindow.document;
      const targetPage = targetDoc.getElementById(`page-${pageNum}`);
      if (targetPage) {
        targetPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (e) {
      // Fallback scroll on main iframe container
      const pageHeight = 1122; // ~297mm at 96dpi
      mainIframe.contentWindow.scrollTo({
        top: (pageNum - 1) * pageHeight,
        behavior: 'smooth'
      });
    }

    // Update active pill
    pagePills.forEach(pill => {
      if (pill.dataset.page === String(pageNum)) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }

  // Print Active Resume
  function printActiveResume() {
    if (mainIframe && mainIframe.contentWindow) {
      mainIframe.contentWindow.focus();
      mainIframe.contentWindow.print();
    }
  }

  // Toggle Side-by-Side Compare Mode
  function toggleCompareMode() {
    isCompareMode = !isCompareMode;
    if (isCompareMode) {
      btnCompare.classList.add('active');
      previewStage.classList.add('compare-mode');
      compareIframeCard.style.display = 'flex';
      // Load both editions
      mainIframe.src = EDITIONS['dark-luxury'].src;
      compareIframe.src = EDITIONS['warm-ivory'].src;
      mainIframeTitle.textContent = EDITIONS['dark-luxury'].name;
      currentZoom = Math.min(currentZoom, 0.72);
      applyZoom();
    } else {
      btnCompare.classList.remove('active');
      previewStage.classList.remove('compare-mode');
      compareIframeCard.style.display = 'none';
      setEdition(currentEdition);
    }
  }

  // Event Listeners
  function setupEventListeners() {
    btnDarkLuxury.addEventListener('click', () => {
      if (isCompareMode) toggleCompareMode();
      setEdition('dark-luxury');
    });

    btnWarmIvory.addEventListener('click', () => {
      if (isCompareMode) toggleCompareMode();
      setEdition('warm-ivory');
    });

    document.getElementById('btnZoomIn').addEventListener('click', zoomIn);
    document.getElementById('btnZoomOut').addEventListener('click', zoomOut);
    document.getElementById('btnZoomActual').addEventListener('click', zoomActual);
    document.getElementById('btnZoomFit').addEventListener('click', zoomFit);

    btnCompare.addEventListener('click', toggleCompareMode);
    btnPrint.addEventListener('click', printActiveResume);

    pagePills.forEach(pill => {
      pill.addEventListener('click', () => {
        scrollToPage(parseInt(pill.dataset.page, 10));
      });
    });

    // Close tip bar
    const closeTipBtn = document.getElementById('closeTipBtn');
    if (closeTipBtn) {
      closeTipBtn.addEventListener('click', () => {
        const bar = document.getElementById('printTipBar');
        if (bar) bar.style.display = 'none';
      });
    }

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === '1') {
        setEdition('dark-luxury');
      } else if (e.key === '2') {
        setEdition('warm-ivory');
      } else if (e.key === 'p' || e.key === 'P') {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          printActiveResume();
        }
      } else if (e.key === 'c' || e.key === 'C') {
        toggleCompareMode();
      } else if (e.key === '=' || e.key === '+') {
        zoomIn();
      } else if (e.key === '-') {
        zoomOut();
      } else if (e.key === '0') {
        zoomActual();
      }
    });

    // Window Resize
    window.addEventListener('resize', () => {
      // Keep within bounds on major resize
    });
  }

  // Start app
  document.addEventListener('DOMContentLoaded', init);
})();
