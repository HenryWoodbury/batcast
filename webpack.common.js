const path = require('path');

const ESLintPlugin = require('eslint-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    serviceWorker: './src/serviceWorker.ts',
    contentScript: './src/contentScript.ts',
    settingScript: './src/settingScript.ts',
    popup: './src/pages/popup.ts',
    options: './src/pages/options.ts',
    batcast: './src/pages/batcast.ts',
    players: './src/pages/players.ts',
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)x?$/,
        use: ['babel-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.(scss|css|sass)$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
// If using `fs` to load local files, webpack > 5 requires this fallback    
//    fallback: {
//      "fs": false
//    },
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  plugins: [
//    new DotenvPlugin(),
    new ESLintPlugin({
      extensions: ['js', 'ts'],
      configType: 'eslintrc',
    }),
    new MiniCssExtractPlugin({
      filename: 'styles/[name].css',
    }),
    new CopyPlugin({
      patterns: [{ from: 'static' }],
    }),
  ],
};
