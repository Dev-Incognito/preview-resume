/**
 * GHAZAL BHATNAGAR — RESUME PREVIEW & CUSTOMIZER PORTAL
 * Interactive Controller Engine: Live Font Selector, Color Picker & Canvas Theming
 */

(function () {
  'use strict';

  // State
  let currentEdition = 'executive'; // 'executive' | 'warm-ivory'
  let currentZoom = 0.95;
  let isCompareMode = false;

  // Customization State
  let activeFont = "'Plus Jakarta Sans', sans-serif";
  let activeAccent = "#b8860b";
  let activeAccentLight = "#e5b838";
  let activeTone = {
    bg: "#090c12",
    tile: "#121722",
    tileAlt: "#181f2d",
    text: "#ffffff",
    sub: "#cbd5e1"
  };

  const EDITIONS = {
    'executive': {
      id: 'executive',
      name: 'Executive Frameless Edition — Ghazal Bhatnagar',
      shortName: 'Executive Frameless',
      src: 'editions/executive-edition.html',
      badge: 'Frameless Architecture • QR Tile',
      themeBg: '#090c12'
    },
    'warm-ivory': {
      id: 'warm-ivory',
      name: 'Warm Ivory Edition — Ghazal Bhatnagar',
      shortName: 'Warm Ivory',
      src: 'editions/warm-ivory.html',
      badge: 'Executive Editorial • Warm Ivory',
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
  const btnExecutive = document.getElementById('btnExecutive');
  const btnWarmIvory = document.getElementById('btnWarmIvory');
  const btnCompare = document.getElementById('btnCompare');
  const btnPrint = document.getElementById('btnPrint');
  const btnOpenStandalone = document.getElementById('btnOpenStandalone');
  const pagePills = document.querySelectorAll('.page-pill');

  // Customizer DOM
  const fontSelector = document.getElementById('fontSelector');
  const colorSwatchBtns = document.querySelectorAll('.color-swatch-btn');
  const customColorInput = document.getElementById('customColorInput');
  const themeToneBtns = document.querySelectorAll('.theme-tone-btn');

  // Initialize
  function init() {
    calculateInitialZoom();
    applyZoom();
    setupEventListeners();
    setupCustomizerListeners();
    setEdition('executive');
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
    if (editionId === 'executive') {
      btnExecutive.classList.add('active');
      btnWarmIvory.classList.remove('active');
    } else {
      btnExecutive.classList.remove('active');
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
    applyCustomizationsToIframe(mainIframe);
  });

  if (compareIframe) {
    compareIframe.addEventListener('load', () => {
      compareIframe.classList.remove('loading');
      injectIframeStyles(compareIframe);
      applyCustomizationsToIframe(compareIframe);
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
    } catch (e) {}
  }

  // Apply Live Customizations to an Iframe
  function applyCustomizationsToIframe(iframe) {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      if (!doc || !doc.documentElement) return;
      const root = doc.documentElement;

      // Font
      root.style.setProperty('--font-heading', activeFont);
      root.style.setProperty('--font-display', activeFont);

      // Colors
      root.style.setProperty('--accent', activeAccent);
      root.style.setProperty('--accent-light', activeAccentLight);
      root.style.setProperty('--accent-dim', hexToRgba(activeAccent, 0.16));
      root.style.setProperty('--accent-glow', hexToRgba(activeAccent, 0.35));

      // Tone / Background
      if (activeTone) {
        root.style.setProperty('--page-bg', activeTone.bg);
        root.style.setProperty('--tile-bg', activeTone.tile);
        root.style.setProperty('--tile-bg-alt', activeTone.tileAlt);
        root.style.setProperty('--text-primary', activeTone.text);
        root.style.setProperty('--text-secondary', activeTone.sub);
        root.style.setProperty('--sidebar-bg', activeTone.bg);
        iframe.style.backgroundColor = activeTone.bg;
      }
    } catch (e) {}
  }

  function broadcastCustomizations() {
    applyCustomizationsToIframe(mainIframe);
    if (compareIframe && isCompareMode) {
      applyCustomizationsToIframe(compareIframe);
    }
  }

  function hexToRgba(hex, alpha) {
    let c = hex.replace('#', '');
    if (c.length === 3) {
      c = c.split('').map(x => x + x).join('');
    }
    const num = parseInt(c, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Setup Customizer Listeners
  function setupCustomizerListeners() {
    // Font Selector
    if (fontSelector) {
      fontSelector.addEventListener('change', (e) => {
        activeFont = e.target.value;
        broadcastCustomizations();
      });
    }

    // Color Swatches
    colorSwatchBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        colorSwatchBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeAccent = btn.dataset.color;
        activeAccentLight = btn.dataset.light || activeAccent;
        if (customColorInput) customColorInput.value = activeAccent;
        broadcastCustomizations();
      });
    });

    // Custom Color Input
    if (customColorInput) {
      customColorInput.addEventListener('input', (e) => {
        colorSwatchBtns.forEach(b => b.classList.remove('active'));
        activeAccent = e.target.value;
        activeAccentLight = lightenColor(activeAccent, 20);
        broadcastCustomizations();
      });
    }

    // Theme Tone Switcher
    themeToneBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        themeToneBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeTone = {
          bg: btn.dataset.bg,
          tile: btn.dataset.tile,
          tileAlt: btn.dataset.tileAlt,
          text: btn.dataset.text,
          sub: btn.dataset.sub
        };
        broadcastCustomizations();
      });
    });
  }

  function lightenColor(color, percent) {
    let num = parseInt(color.replace('#', ''), 16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) + amt,
      G = (num >> 8 & 0x00FF) + amt,
      B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
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
      const pageHeight = 1122;
      mainIframe.contentWindow.scrollTo({
        top: (pageNum - 1) * pageHeight,
        behavior: 'smooth'
      });
    }

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
      mainIframe.src = EDITIONS['executive'].src;
      compareIframe.src = EDITIONS['warm-ivory'].src;
      mainIframeTitle.textContent = EDITIONS['executive'].name;
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
    btnExecutive.addEventListener('click', () => {
      if (isCompareMode) toggleCompareMode();
      setEdition('executive');
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

    const closeTipBtn = document.getElementById('closeTipBtn');
    if (closeTipBtn) {
      closeTipBtn.addEventListener('click', () => {
        const bar = document.getElementById('printTipBar');
        if (bar) bar.style.display = 'none';
      });
    }

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === '1') {
        setEdition('executive');
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
  }

  // Start app
  document.addEventListener('DOMContentLoaded', init);
})();
