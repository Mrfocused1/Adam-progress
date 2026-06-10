/** Build: npx -y tailwindcss@3 -c tailwind.config.js -i tailwind-input.css -o assets/tailwind.css --minify
 *  Re-run whenever Tailwind classes change in index.html / app.js / assets JS templates.
 *  Theme must stay in sync with the design tokens used across styles.css. */
module.exports = {
  content: ['./index.html', './app.js', './assets/**/*.js'],
  theme: {
    extend: {
      colors: {
        ink:       '#050505',
        ink2:      '#0D0D0D',
        panel:     '#111111',
        red:       '#D90429',
        redHot:    '#FF2D2D',
        redDeep:   '#B3001B',
        text:      '#F2F2F2',
        text2:     '#A0A0A0',
        border:    '#2A2A2A',
      },
      fontFamily: {
        display: ['"Anton"', '"Druk Condensed Super"', 'Impact', 'sans-serif'],
        brush:   ['"Permanent Marker"', '"Brutal Brush"', '"Streetbrush"', 'cursive'],
        sub:     ['"Bebas Neue"', '"Barlow Condensed"', 'sans-serif'],
        body:    ['"Inter"', 'system-ui', 'sans-serif'],
        stat:    ['"Montserrat"', 'sans-serif'],
      },
    },
  },
};
