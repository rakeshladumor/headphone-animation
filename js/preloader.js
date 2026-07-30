import { padNumber } from './utils.js';

export class ImagePreloader {
  constructor(options) {
    // options: { totalFrames: 240, basePath: 'headphonjpg', filePrefix: 'ezgif-frame-', fileExtension: '.jpg', padLength: 3 }
    this.totalFrames = options.totalFrames || 240;
    this.basePath = options.basePath || 'headphonjpg';
    this.filePrefix = options.filePrefix || 'ezgif-frame-';
    this.fileExtension = options.fileExtension || '.jpg';
    this.padLength = options.padLength || 3;
    this.images = new Array(this.totalFrames).fill(null);
    this.loadedCount = 0;
    this.onProgress = null; // callback(progress: 0-1, loaded: number, total: number)
    this.onInitialLoad = null; // callback() when initial batch done
    this.onComplete = null; // callback() when all frames done
  }

  getFramePath(index) {
    // index is 0-based, file names are 1-based
    const frameNum = index + 1;
    return `${this.basePath}/${this.filePrefix}${padNumber(frameNum, this.padLength)}${this.fileExtension}`;
  }

  loadImage(index) {
    return new Promise((resolve) => {
      if (this.images[index]) { 
        resolve(this.images[index]); 
        return; 
      }
      const img = new Image();
      img.onload = () => {
        this.images[index] = img;
        this.loadedCount++;
        if (this.onProgress) {
            this.onProgress(this.loadedCount / this.totalFrames, this.loadedCount, this.totalFrames);
        }
        resolve(img);
      };
      img.onerror = () => {
        console.warn(`Failed to load frame ${index}`);
        resolve(null); // Don't reject, continue loading
      };
      img.src = this.getFramePath(index);
    });
  }

  async preloadInitial(count = 20) {
    const promises = [];
    for (let i = 0; i < Math.min(count, this.totalFrames); i++) {
      promises.push(this.loadImage(i));
    }
    await Promise.all(promises);
    if (this.onInitialLoad) this.onInitialLoad();
  }

  async preloadRemaining(initialCount = 20) {
    // Load remaining frames in small batches to avoid overwhelming the browser
    const batchSize = 10;
    for (let i = initialCount; i < this.totalFrames; i += batchSize) {
      const batch = [];
      for (let j = i; j < Math.min(i + batchSize, this.totalFrames); j++) {
        batch.push(this.loadImage(j));
      }
      await Promise.all(batch);
      // Yield to main thread between batches
      await new Promise(r => setTimeout(r, 0));
    }
    if (this.onComplete) this.onComplete();
  }

  getImage(index) {
    const clamped = Math.max(0, Math.min(index, this.totalFrames - 1));
    return this.images[clamped];
  }

  getProgress() {
    return this.loadedCount / this.totalFrames;
  }

  isLoaded(index) {
    return this.images[index] !== null;
  }

  // Find nearest loaded frame (fallback for unloaded frames)
  getNearestLoadedFrame(targetIndex) {
    if (this.images[targetIndex]) return this.images[targetIndex];
    // Search outward from target
    for (let offset = 1; offset < this.totalFrames; offset++) {
      if (targetIndex - offset >= 0 && this.images[targetIndex - offset]) {
          return this.images[targetIndex - offset];
      }
      if (targetIndex + offset < this.totalFrames && this.images[targetIndex + offset]) {
          return this.images[targetIndex + offset];
      }
    }
    return null;
  }
}
