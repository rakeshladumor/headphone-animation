export class CanvasRenderer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.width = 0;
    this.height = 0;
    this.dpr = window.devicePixelRatio || 1;
    this.lastDrawnImage = null;
    this.backgroundColor = '#050505';
    
    this.resize();
    this._onResize = this.resize.bind(this);
    window.addEventListener('resize', this._onResize);
  }

  resize() {
    this.dpr = window.devicePixelRatio || 1;
    const parent = this.canvas.parentElement;
    
    if (parent) {
      this.width = parent.clientWidth;
      this.height = parent.clientHeight;
    } else {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
    }
    
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    
    this.ctx.scale(this.dpr, this.dpr);
    
    // Redraw last frame after resize
    if (this.lastDrawnImage) {
      this.drawFrame(this.lastDrawnImage);
    } else {
      this.clear();
    }
  }

  clear() {
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawFrame(image) {
    if (!image) return;
    this.lastDrawnImage = image;
    
    // Clear with background color
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Calculate contain-fit dimensions (NEVER crop, always center)
    const imgRatio = image.naturalWidth / image.naturalHeight;
    const canvasRatio = this.width / this.height;
    let renderW, renderH, x, y;
    
    if (canvasRatio > imgRatio) {
      // Canvas is wider than image — fit to height
      renderH = this.height;
      renderW = this.height * imgRatio;
      x = (this.width - renderW) / 2;
      y = 0;
    } else {
      // Canvas is taller than image — fit to width
      renderW = this.width;
      renderH = this.width / imgRatio;
      x = 0;
      y = (this.height - renderH) / 2;
    }
    
    // Use high quality image smoothing
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    
    this.ctx.drawImage(image, x, y, renderW, renderH);
  }

  destroy() {
    window.removeEventListener('resize', this._onResize);
  }
}
