const path = require('path')

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js'
  },
  target: 'node',
  module: {
    rules: [
        {
            test: /\.tsx?$/,
            loader: 'ts-loader',
            options: {
              transpileOnly: true
            }
        }
    ]
  },
  resolve: {
    extensions: [ '.ts', '.tsx', '.js' ]
  }
}