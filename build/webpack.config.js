'use strict'

const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const CopyPLugin = require('copy-webpack-plugin')

const baseDir = path.resolve(__dirname, '../src')

/**@type {import('webpack').Configuration}*/
const config = {
  target: 'node',
  mode: 'development',
  entry: path.resolve(baseDir, './extension.ts'),
  output: {
    clean: true,
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
  },
  optimization: {
    minimize: false,
    minimizer: [new TerserPlugin({ extractComments: false })],
  },
  devtool: 'nosources-source-map',
  externals: {
    vscode: 'commonjs vscode',
  },
  resolve: {
    plugins: [],
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new CopyPLugin({
      patterns: [{ from: path.resolve(baseDir, './template-package.json'), to: 'package.json' }],
    }),
  ],
}
module.exports = config
