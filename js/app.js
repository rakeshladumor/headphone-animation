import { ImagePreloader } from './preloader.js';
import { CanvasRenderer } from './canvas.js';
import { ScrollController } from './scroll.js';
import { OverlayController } from './overlay.js';
import { NavbarController } from './navbar.js';

class App {
  constructor() {
    // DOM elements
    this.preloaderEl = document.getElementById('preloader');
    this.progressBarFill = document.querySelector('.progress-bar-fill');
    this.progressText = document.querySelector('.progress-text');
    this.canvasEl = document.getElementById('product-canvas');
    this.scrollStage = document.getElementById('scroll-stage');
    
    // Modules
    this.preloader = null;
    this.canvas = null;
    this.scrollController = null;
    this.overlay = null;
    this.navbar = null;
    
    this.isReady = false;
    this.lastRenderedFrame = -1;
  }

  async init() {
    // 1. Initialize canvas renderer
    this.canvas = new CanvasRenderer(this.canvasEl);
    
    // 2. Initialize image preloader
    this.preloader = new ImagePreloader({
      totalFrames: 240,
      basePath: 'headphonjpg',
      filePrefix: 'ezgif-frame-',
      fileExtension: '.jpg',
      padLength: 3
    });

    // Progress callback
    this.preloader.onProgress = (progress, loaded, total) => {
      this._updateProgress(progress);
    };

    // 3. Preload initial frames and show the site
    await this.preloader.preloadInitial(20);
    
    // Draw first frame immediately
    const firstFrame = this.preloader.getImage(0);
    if (firstFrame) this.canvas.drawFrame(firstFrame);
    
    // 4. Hide preloader and reveal site
    this._revealSite();
    
    // 5. Initialize scroll controller
    this.scrollController = new ScrollController({
      container: this.scrollStage,
      totalFrames: 240
    });
    
    // 6. Initialize overlay controller
    this.overlay = new OverlayController();
    
    // 7. Initialize navbar
    this.navbar = new NavbarController();
    
    // 8. Connect scroll to canvas and overlays
    this.scrollController.onFrameChange((frame, progress) => {
      this._onFrameUpdate(frame, progress);
    });
    
    // 9. Force initial update
    this.scrollController.forceUpdate();
    
    // 10. Load remaining frames in background
    this.preloader.preloadRemaining(20);
    
    // 11. Initialize intersection observer for below-fold sections
    this._initRevealObserver();
    
    this.isReady = true;
  }

  _updateProgress(progress) {
    // Only update during preload (first 20 frames map to 0-100%)
    const displayProgress = Math.min(progress * (240 / 20), 1);
    if (this.progressBarFill) {
      this.progressBarFill.style.width = `${Math.round(displayProgress * 100)}%`;
    }
    if (this.progressText) {
      this.progressText.textContent = `${Math.round(displayProgress * 100)}%`;
    }
  }

  _revealSite() {
    if (this.preloaderEl) {
      this.preloaderEl.classList.add('loaded');
      // Remove from DOM after transition
      setTimeout(() => {
        if (this.preloaderEl && this.preloaderEl.parentNode) {
          this.preloaderEl.parentNode.removeChild(this.preloaderEl);
        }
      }, 1000);
    }
  }

  _onFrameUpdate(frameIndex, progress) {
    // Only redraw if frame actually changed
    if (frameIndex !== this.lastRenderedFrame) {
      const image = this.preloader.getImage(frameIndex) || this.preloader.getNearestLoadedFrame(frameIndex);
      if (image) {
        this.canvas.drawFrame(image);
        this.lastRenderedFrame = frameIndex;
      }
    }
    
    // Update text overlays
    if (this.overlay) {
      this.overlay.update(progress);
    }
  }

  _initRevealObserver() {
    const revealElements = document.querySelectorAll('[data-reveal]');
    if (!revealElements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add staggered delay based on data attribute
          const delay = entry.target.dataset.revealDelay || 0;
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, parseInt(delay));
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -100px 0px',
      threshold: 0.1
    });

    revealElements.forEach(el => observer.observe(el));
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init().catch(err => console.error('App initialization failed:', err));
});
