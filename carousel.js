/**
 * Carousel — exportable, self-contained component.
 *
 * Usage:
 *   import { Carousel } from './carousel/carousel.js';
 *
 *   const images = [
 *     'photo1.jpg',
 *     { src: 'photo2.jpg', alt: 'Living room' },
 *   ];
 *
 *   new Carousel('#my-carousel', images, {
 *     dotColor:        '#e8e8ac',
 *     dotActiveColor:  '#a88a58',
 *     arrowColor:      '#968054',
 *     autoPlay:        true,
 *     autoPlayInterval: 30000,
 *   });
 *
 * The container element receives the generated markup; any pre-existing
 * content is preserved (cleared only when destroy() is called).
 */

export class Carousel {
  /**
   * @param {string|HTMLElement} container - CSS selector or DOM element
   * @param {Array<string|{src:string, alt?:string}>} images
   * @param {object} [options]
   * @param {string}  [options.dotColor='#e8e8ac']
   * @param {string}  [options.dotActiveColor='#a88a58']
   * @param {string}  [options.arrowColor='#968054']
   * @param {boolean} [options.autoPlay=true]
   * @param {number}  [options.autoPlayInterval=30000]
   */
  constructor(container, images, options = {}) {
    this._root =
      typeof container === 'string'
        ? document.querySelector(container)
        : container;

    if (!this._root) throw new Error(`Carousel: container "${container}" not found`);
    if (!images?.length) throw new Error('Carousel: images array must not be empty');

    this._images = images;
    this._options = {
      dotColor: '#e8e8ac',
      dotActiveColor: '#a88a58',
      arrowColor: '#968054',
      autoPlay: true,
      autoPlayInterval: 30000,
      ...options,
    };

    this._currentIndex = 0;
    this._autoPlayTimer = null;
    this._touchStartX = null;
    this._touchStartY = null;

    this._build();
    this._applyColors();
    this._bindEvents();

    if (this._options.autoPlay) this._startAutoPlay();
  }

  // ─── Build ────────────────────────────────────────────────────────────────

  _build() {
    this._root.classList.add('carousel');

    // Track wrapper (clips overflow)
    const wrapper = document.createElement('div');
    wrapper.classList.add('carousel__track-wrapper');

    this._track = document.createElement('div');
    this._track.classList.add('carousel__track');

    this._images.forEach((image, i) => {
      const slide = document.createElement('div');
      slide.classList.add('carousel__slide');

      const img = document.createElement('img');
      img.classList.add('carousel__img');

      if (typeof image === 'string') {
        img.src = image;
        img.alt = `Slide ${i + 1}`;
      } else {
        img.src = image.src;
        img.alt = image.alt ?? `Slide ${i + 1}`;
      }

      slide.appendChild(img);
      this._track.appendChild(slide);
    });

    wrapper.appendChild(this._track);

    // Controls (prev / next)
    const controls = document.createElement('div');
    controls.classList.add('carousel__controls');

    this._btnPrev = this._createArrowButton('chevron_left', 'Slide précédente');
    this._btnNext = this._createArrowButton('chevron_right', 'Slide suivante');

    controls.appendChild(this._btnPrev);
    controls.appendChild(this._btnNext);

    // Dots
    this._dotsContainer = document.createElement('div');
    this._dotsContainer.classList.add('carousel__dots');

    this._dots = this._images.map((_, i) => {
      const dot = document.createElement('button');
      dot.classList.add('carousel__dot');
      dot.setAttribute('aria-label', `Aller à la slide ${i + 1}`);
      if (i === 0) dot.classList.add('carousel__dot--active');
      this._dotsContainer.appendChild(dot);
      return dot;
    });

    this._root.appendChild(wrapper);
    this._root.appendChild(controls);
    this._root.appendChild(this._dotsContainer);
  }

  _createArrowButton(icon, label) {
    const btn = document.createElement('button');
    btn.classList.add('carousel__btn');
    btn.setAttribute('aria-label', label);
    btn.innerHTML = `<span class="material-symbols-outlined">${icon}</span>`;
    return btn;
  }

  // ─── Colors ───────────────────────────────────────────────────────────────

  _applyColors() {
    const { dotColor, dotActiveColor, arrowColor } = this._options;
    this._root.style.setProperty('--carousel-dot-color', dotColor);
    this._root.style.setProperty('--carousel-dot-active-color', dotActiveColor);
    this._root.style.setProperty('--carousel-arrow-color', arrowColor);
  }

  /**
   * Update colors after instantiation.
   * @param {{ dotColor?, dotActiveColor?, arrowColor? }} colors
   */
  setColors(colors = {}) {
    Object.assign(this._options, colors);
    this._applyColors();
  }

  // ─── Events ───────────────────────────────────────────────────────────────

  _bindEvents() {
    this._btnNext.addEventListener('click', () => this.next());
    this._btnPrev.addEventListener('click', () => this.prev());

    this._dots.forEach((dot, i) => {
      dot.addEventListener('click', () => this.goTo(i));
    });

    // Touch / swipe
    this._track.addEventListener('touchstart', (e) => this._onTouchStart(e), { passive: true });
    this._track.addEventListener('touchmove', (e) => this._onTouchMove(e));
  }

  _onTouchStart(e) {
    this._touchStartX = e.touches[0].clientX;
    this._touchStartY = e.touches[0].clientY;
  }

  _onTouchMove(e) {
    if (this._touchStartX === null || this._touchStartY === null) return;

    const diffX = this._touchStartX - e.touches[0].clientX;
    const diffY = this._touchStartY - e.touches[0].clientY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      diffX > 0 ? this.next() : this.prev();
      e.preventDefault();
    }

    this._touchStartX = null;
    this._touchStartY = null;
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  /** Navigate to a specific slide index (0-based). */
  goTo(index) {
    const clamped = Math.max(0, Math.min(index, this._images.length - 1));
    this._dots[this._currentIndex].classList.remove('carousel__dot--active');
    this._currentIndex = clamped;
    this._dots[this._currentIndex].classList.add('carousel__dot--active');
    this._track.style.transform = `translateX(${this._currentIndex * -100}%)`;
  }

  /** Advance to the next slide (stops at the last). */
  next() {
    if (this._currentIndex < this._images.length - 1) {
      this.goTo(this._currentIndex + 1);
    }
  }

  /** Go back to the previous slide (stops at the first). */
  prev() {
    if (this._currentIndex > 0) {
      this.goTo(this._currentIndex - 1);
    }
  }

  _startAutoPlay() {
    this._autoPlayTimer = setInterval(() => this.next(), this._options.autoPlayInterval);
  }

  /** Pause auto-play. */
  stopAutoPlay() {
    clearInterval(this._autoPlayTimer);
    this._autoPlayTimer = null;
  }

  /** Remove all generated markup and stop auto-play. */
  destroy() {
    this.stopAutoPlay();
    this._root.innerHTML = '';
    this._root.classList.remove('carousel');
    this._root.removeAttribute('style');
  }
}
