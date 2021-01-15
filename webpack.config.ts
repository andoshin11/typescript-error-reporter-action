import path from 'path';
import webpack from 'webpack';

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
  },
  target: 'node',
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename], // you may omit this when your CLI automatically adds it
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
} as webpack.Configuration;
