# Ready-to-Use Carousel

A lightweight, dependency-free image carousel component in vanilla JavaScript.

## Features

- Vanilla JS class (`Carousel`)
- Simple setup with a container + image list
- Previous/next arrows
- Dot navigation
- Touch swipe support
- Auto-play support
- Customizable colors and interval

## Files

- `carousel.js`: component logic and exported `Carousel` class
- `carousel.css`: component styles
- `demo.html`: working example with two carousels

## Quick Start

1. Add the stylesheet for icons (used by arrow buttons):

```html
<link rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />
```

2. Create a container element:

```html
<div id="my-carousel"></div>
```

3. Import and initialize in a module script:

```html
<script type="module">
  import { Carousel } from './carousel.js';

  const images = [
    'https://picsum.photos/seed/a/800/500',
    { src: 'https://picsum.photos/seed/b/800/500', alt: 'Living room' },
    'https://picsum.photos/seed/c/800/500'
  ];

  new Carousel('#my-carousel', images, {
    dotColor: '#c9d6e3',
    dotActiveColor: '#2c6fad',
    arrowColor: '#2c6fad',
    autoPlay: true,
    autoPlayInterval: 5000
  });
</script>
```

No CSS import is required: styles are injected automatically when the first `Carousel` instance is created.

## API

### Constructor

```js
new Carousel(container, images, options)
```

- `container`: CSS selector string or `HTMLElement`
- `images`: array of:
  - string URLs (`"image.jpg"`)
  - objects (`{ src: "image.jpg", alt: "Description" }`)
- `options` (optional): configuration object

### Options

- `dotColor` (string, default: `#e8e8ac`)
- `dotActiveColor` (string, default: `#a88a58`)
- `arrowColor` (string, default: `#968054`)
- `autoPlay` (boolean, default: `true`)
- `autoPlayInterval` (number in ms, default: `30000`)

### Public Methods

- `goTo(index)`: jump to a slide (0-based)
- `next()`: move to next slide
- `prev()`: move to previous slide
- `setColors({ dotColor, dotActiveColor, arrowColor })`: update theme colors
- `stopAutoPlay()`: stop the timer
- `destroy()`: remove generated markup and cleanup

## Run the Demo

Because `demo.html` uses JavaScript modules, run it through a local server instead of opening it directly via `file://`.

### Option 1: Python

```bash
python3 -m http.server 8080
```

Then open:

- `http://localhost:8080/demo.html`

### Option 2: Node (`serve`)

```bash
npx serve .
```

Then open the URL shown in the terminal and navigate to `demo.html`.

## Notes

- The carousel moves until the last slide, then stops (`next()` does not loop).
- On small screens (`max-width: 560px`), arrow controls are hidden in CSS and swipe/dots remain available.
