import { clamp, mapRange, rafThrottle } from './utils.js';

export class ScrollController {
  constructor(options) {
    // options: { container: DOM element (the scroll-stage), totalFrames: 240 }
    this.container = options.container;
    this.totalFrames = options.totalFrames || 240;
    
    // Frame mapping configuration
    // 0% - 85% scroll: frames 0 to 203 (forward: assembled → exploded)
    // 85% - 100% scroll: frames 203 to 35 (reverse: exploded → reassembled)
    this.forwardEnd = 203; // frame index at 85% scroll (frame 204, 0-indexed as 203)
    this.reverseEnd = 35;  // frame index at 100% scroll (frame 36, 0-indexed as 35)
    this.splitPoint = 0.85; // The scroll percentage where forward ends and reverse begins
    
    this.currentFrame = 0;
    this.targetFrame = 0;
    this.progress = 0;
    this.callbacks = [];
    this.isActive = true;
    this.animFrameId = null;
    
    this._onScroll = rafThrottle(this._handleScroll.bind(this));
    window.addEventListener('scroll', this._onScroll, { passive: true });
    
    // Start smooth frame interpolation loop
    this._startRenderLoop();
  }

  _handleScroll() {
    if (!this.isActive) return;
    
    const rect = this.container.getBoundingClientRect();
    const totalScrollable = this.container.clientHeight - window.innerHeight;
    
    // Prevent division by zero if totalScrollable is 0 or negative
    if (totalScrollable <= 0) {
      this.progress = 0;
    } else {
      const scrolled = Math.max(0, -rect.top);
      this.progress = clamp(scrolled / totalScrollable, 0, 1);
    }
    
    // Calculate target frame based on scroll progress
    this.targetFrame = this._progressToFrame(this.progress);
  }

  _progressToFrame(progress) {
    if (progress <= this.splitPoint) {
      // Forward playback: 0% → 85% maps to frame 0 → forwardEnd
      const normalizedProgress = progress / this.splitPoint;
      return Math.round(mapRange(normalizedProgress, 0, 1, 0, this.forwardEnd));
    } else {
      // Reverse playback: 85% → 100% maps to frame forwardEnd → reverseEnd
      const normalizedProgress = (progress - this.splitPoint) / (1 - this.splitPoint);
      return Math.round(mapRange(normalizedProgress, 0, 1, this.forwardEnd, this.reverseEnd));
    }
  }

  _startRenderLoop() {
    const loop = () => {
      // Smooth interpolation toward target frame for buttery feel
      if (this.currentFrame !== this.targetFrame) {
        // Use integer lerp — move toward target
        const diff = this.targetFrame - this.currentFrame;
        if (Math.abs(diff) <= 1) {
          this.currentFrame = this.targetFrame;
        } else {
          this.currentFrame += Math.sign(diff) * Math.max(1, Math.floor(Math.abs(diff) * 0.3));
        }
        this._notifyCallbacks();
      }
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  _notifyCallbacks() {
    for (const cb of this.callbacks) {
      cb(this.currentFrame, this.progress);
    }
  }

  onFrameChange(callback) {
    this.callbacks.push(callback);
  }

  getProgress() {
    return this.progress;
  }

  getCurrentFrame() {
    return this.currentFrame;
  }

  // Force update (e.g. after resize)
  forceUpdate() {
    this._handleScroll();
    this.currentFrame = this.targetFrame;
    this._notifyCallbacks();
  }

  destroy() {
    this.isActive = false;
    window.removeEventListener('scroll', this._onScroll);
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
  }
}
