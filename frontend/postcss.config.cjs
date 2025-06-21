const { createPostCSSConfig } = require('./config/index.js');

module.exports = {
  plugins: [
    require('@tailwindcss/postcss'),
    require('autoprefixer'),
  ],
};
