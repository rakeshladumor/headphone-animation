import { clamp, mapRange } from './utils.js';

export class OverlayController {
  constructor() {
    // Define the 5 story beats with their scroll ranges and DOM IDs
    this.beats = [
      { id: 'overlay-hero',        inStart: 0.00, inEnd: 0.03,  outStart: 0.12, outEnd: 0.15, alignment: 'center' },
      { id: 'overlay-engineering',  inStart: 0.15, inEnd: 0.20,  outStart: 0.35, outEnd: 0.40, alignment: 'left' },
      { id: 'overlay-anc',         inStart: 0.40, inEnd: 0.45,  outStart: 0.60, outEnd: 0.65, alignment: 'right' },
      { id: 'overlay-sound',       inStart: 0.65, inEnd: 0.70,  outStart: 0.80, outEnd: 0.85, alignment: 'left' },
      { id: 'overlay-cta',         inStart: 0.85, inEnd: 0.90,  outStart: 0.98, outEnd: 1.00, alignment: 'center' },
    ];

    this.panels = {};
    this.heroGlow = document.querySelector('.hero-glow');
    
    // Cache DOM elements
    for (const beat of this.beats) {
      const el = document.getElementById(beat.id);
      if (el) {
        this.panels[beat.id] = el;
      }
    }
  }

  update(progress) {
    for (const beat of this.beats) {
      const panel = this.panels[beat.id];
      if (!panel) continue;

      let opacity = 0;
      let translateY = 30;

      if (progress < beat.inStart) {
        // Before the beat — hidden
        opacity = 0;
        translateY = 30;
      } else if (progress >= beat.inStart && progress < beat.inEnd) {
        // Fading in
        const t = mapRange(progress, beat.inStart, beat.inEnd, 0, 1);
        opacity = t;
        translateY = 30 * (1 - t);
      } else if (progress >= beat.inEnd && progress < beat.outStart) {
        // Fully visible
        opacity = 1;
        translateY = 0;
      } else if (progress >= beat.outStart && progress < beat.outEnd) {
        // Fading out
        const t = mapRange(progress, beat.outStart, beat.outEnd, 0, 1);
        opacity = 1 - t;
        translateY = -20 * t;
      } else {
        // After the beat — hidden
        opacity = 0;
        translateY = -20;
      }

      panel.style.opacity = clamp(opacity, 0, 1);
      panel.style.transform = `translateY(${translateY}px)`;
      
      if (opacity > 0.01) {
        panel.classList.add('visible');
        panel.style.pointerEvents = 'auto';
      } else {
        panel.classList.remove('visible');
        panel.style.pointerEvents = 'none';
      }
    }

    // Hero glow visibility (show during hero and CTA sections)
    if (this.heroGlow) {
      const showGlow = (progress < 0.15) || (progress > 0.85);
      this.heroGlow.classList.toggle('visible', showGlow);
    }
  }
}
