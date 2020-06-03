# Sudoku Solver

<a href="https://lubosmato.github.io/sudoku/#/sudoku/MjY3ODkxNTM0NTQxNzYzMjg5OTM4MjQ1NzYxMzc1IDI4NDk2MTI0OTM2ODc1Njg5NDU3MTIzNDk2NTcyMzE4NzEzNjg0OTUyODUyMzE5NjQ3" target="_blank">Demo (fill 1)</a>

<a href="https://lubosmato.github.io/sudoku/#/" target="_blank">Demo</a>

Sudoku solver is a fun project of mine to test new technologies and to be good at sudoku solving.

The app can: 
1. Generate sudoku puzzle with given difficulty
2. Solve sudoku puzzle
3. Scan sudoku puzzle
4. Share sudoku puzzle link
5. Print sudoku puzzle
6. Download sudoku puzzle image

Everything is written in JavaScript so it is damn slow on some devices 🙂. 

Used technologies:
- [OpenCV.js](https://docs.opencv.org/master/d5/d10/tutorial_js_root.html) - WebAssembly compiled OpenCV
- [Tesseract.js](https://github.com/naptha/tesseract.js) - WebAssembly compiled Tessarct OCR
- [Quasar](https://quasar.dev/) - lovely [Vue.js](https://vuejs.org/) based framework with material design UI (and lot of other stuff)
- [PWA](https://web.dev/progressive-web-apps/)
- [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
- [Vuex](https://vuex.vuejs.org/)

# Scanning steps
1. Apply binary threshold on black and white image
2. Invert colors
3. Find lines with Hough Lines algorithm
4. Group lines into `horizontal` and `vertical` groups based on their slope angle
5. Average lines that are close to each other into single line for both groups
6. Find sequence of 10 lines which have distance between next line approximately same for both groups
7. Find corners defined by intersections of first and last lines from both groups
8. Find perspective transformation and warp input image based on corner points
9. Calculate cells positions
10. Apply Tesseract.js OCR for all found cells

## Install the dependencies
```bash
yarn
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev -m spa
```

### Lint the files
```bash
yarn run lint
```

### Build the app for production
```bash
quasar build -m pwa
```

### Customize the configuration
See [Configuring quasar.conf.js](https://quasar.dev/quasar-cli/quasar-conf-js).
