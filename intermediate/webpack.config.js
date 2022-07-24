const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, './index.js'),
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
    fallback: { fs: false }
  },
  output: {
    filename: 'startupoptionsbotlang.js',
    path: path.resolve(__dirname, 'static'),
    library: 'StartUpOptionsBotLang',
    libraryTarget: 'var'
  }
};