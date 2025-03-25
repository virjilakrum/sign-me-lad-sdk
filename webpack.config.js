const path = require('path');

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'SignMeLad',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  externals: {
    'jsonwebtoken': 'jsonwebtoken', // Not needed for browser
  },
}; 