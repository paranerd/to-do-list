const autoprefixer = require('autoprefixer');
const tailwindcss = require('tailwindcss');
const purgecss = require("@fullhuman/postcss-purgecss");

module.exports = {
    plugins: [
        tailwindcss,
        autoprefixer,
        // Only add purgecss in production
        process.env.NODE_ENV === 'production'
        ? purgecss({
            content: ['./src/**/*.html', './src/**/*.vue'],
            })
        : '',
  ],
}
