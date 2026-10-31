/**
 * GHAZAL BHATNAGAR — RESUME PREVIEW & CUSTOMIZER PORTAL
 * Interactive Controller Engine: Live Font Selector, Color Picker & Canvas Theming
 * Apple Safari & iOS Mobile Optimized
 */

(function () {
  'use strict';

  // State
  let currentZoom = 0.95;

  // Customization State
  let activeFont = "'Plus Jakarta Sans', sans-serif";
  let activeAccent = "#b8860b";
  let activeAccentLight = "#e5b838";
  let activeTone = {
    bg: "#090c12",
    tile: "#121722",
    tileAlt: "#181f2d",
    text: "#ffffff",
    sub: "#cbd5e1",
    muted: "#8392a5"
  };

  const RESUME_SRC = 'editions/resume.html';

  // DOM Elements
  const previewStage = document.getElementById('previewStage');
  const mainIframeCard = document.getElementById('mainIframeCard');
  const mainIframe = document.getElementById('mainIframe');
  const zoomDisplay = document.getElementById('zoomDisplay');
  const activeEditionBadge = document.getElementById('activeEditionBadge');
  const mainIframeTitle = document.getElementById('mainIframeTitle');
  const btnExecutive = document.getElementById('btnExecutive');
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
    setupIframeEvents();
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

  function setupIframeEvents() {
    if (!mainIframe) return;

    mainIframe.addEventListener('load', () => {
      mainIframe.classList.remove('loading');
      applyCustomizationsToIframe(mainIframe);
    });

    if (btnOpenStandalone) {
      btnOpenStandalone.href = RESUME_SRC;
    }
  }

  // Apply Live Customizations to the Iframe
  function applyCustomizationsToIframe(iframe) {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      if (!doc || !doc.documentElement) return;
      const root = doc.documentElement;

      // Font updates
      root.style.setProperty('--font-heading', activeFont);
      root.style.setProperty('--font-display', activeFont);

      // Accent color updates
      root.style.setProperty('--accent', activeAccent);
      root.style.setProperty('--accent-light', activeAccentLight);
      root.style.setProperty('--accent-dim', hexToRgba(activeAccent, 0.16));
      root.style.setProperty('--accent-glow', hexToRgba(activeAccent, 0.35));

      // Tone / Canvas updates
      if (activeTone) {
        root.style.setProperty('--page-bg', activeTone.bg);
        root.style.setProperty('--tile-bg', activeTone.tile);
        root.style.setProperty('--tile-bg-alt', activeTone.tileAlt);
        root.style.setProperty('--text-primary', activeTone.text);
        root.style.setProperty('--text-secondary', activeTone.sub);
        if (activeTone.muted) {
          root.style.setProperty('--text-muted', activeTone.muted);
        }
        iframe.style.backgroundColor = activeTone.bg;
      }
    } catch (e) {
      console.warn('Unable to inject styles into iframe (cross-origin or loading):', e);
    }
  }

  function broadcastCustomizations() {
    applyCustomizationsToIframe(mainIframe);
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

  function lightenColor(color, percent) {
    let num = parseInt(color.replace('#', ''), 16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) + amt,
      G = ((num >> 8) & 0x00ff) + amt,
      B = (num & 0x0000ff) + amt;
    return (
      '#' +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    );
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
    colorSwatchBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        colorSwatchBtns.forEach((b) => b.classList.remove('active'));
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
        colorSwatchBtns.forEach((b) => b.classList.remove('active'));
        activeAccent = e.target.value;
        activeAccentLight = lightenColor(activeAccent, 20);
        broadcastCustomizations();
      });
    }

    // Theme Tone Switcher
    themeToneBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        themeToneBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const isIvory = btn.title && btn.title.toLowerCase().includes('ivory');
        activeTone = {
          bg: btn.dataset.bg,
          tile: btn.dataset.tile,
          tileAlt: btn.dataset.tileAlt,
          text: btn.dataset.text,
          sub: btn.dataset.sub,
          muted: isIvory ? '#78716c' : '#8392a5'
        };
        broadcastCustomizations();
      });
    });
  }

  // Zoom Handling
  function applyZoom() {
    if (previewStage) {
      previewStage.style.transform = `scale(${currentZoom})`;
    }
    if (zoomDisplay) {
      zoomDisplay.textContent = `${Math.round(currentZoom * 100)}%`;
    }
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
      if (mainIframe && mainIframe.contentWindow) {
        mainIframe.contentWindow.scrollTo({
          top: (pageNum - 1) * pageHeight,
          behavior: 'smooth'
        });
      }
    }

    pagePills.forEach((pill) => {
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

  // Event Listeners
  function setupEventListeners() {
    // Zoom Buttons
    const btnZoomIn = document.getElementById('btnZoomIn');
    const btnZoomOut = document.getElementById('btnZoomOut');
    const btnZoomFit = document.getElementById('btnZoomFit');
    const btnZoomActual = document.getElementById('btnZoomActual');

    if (btnZoomIn) btnZoomIn.addEventListener('click', zoomIn);
    if (btnZoomOut) btnZoomOut.addEventListener('click', zoomOut);
    if (btnZoomFit) btnZoomFit.addEventListener('click', zoomFit);
    if (btnZoomActual) btnZoomActual.addEventListener('click', zoomActual);

    // Page Pills
    pagePills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const pageNum = parseInt(pill.dataset.page, 10);
        scrollToPage(pageNum);
      });
    });

    // Print Button
    if (btnPrint) {
      btnPrint.addEventListener('click', printActiveResume);
    }

    // Print Tip Close
    const closeTipBtn = document.getElementById('closeTipBtn');
    const printTipBar = document.getElementById('printTipBar');
    if (closeTipBtn && printTipBar) {
      closeTipBtn.addEventListener('click', () => {
        printTipBar.style.display = 'none';
      });
    }

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        printActiveResume();
      } else if (e.key === '1') {
        scrollToPage(1);
      } else if (e.key === '2') {
        scrollToPage(2);
      } else if (e.key === '3') {
        scrollToPage(3);
      } else if (e.key === '+' || e.key === '=') {
        zoomIn();
      } else if (e.key === '-') {
        zoomOut();
      } else if (e.key === '0') {
        zoomFit();
      }
    });

    // Window Resize -> Recalculate Zoom if on small screen
    window.addEventListener('resize', () => {
      if (window.innerWidth < 900) {
        calculateInitialZoom();
        applyZoom();
      }
    });
  }

  // Launch
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
