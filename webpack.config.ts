import webpack from 'webpack';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const htmlWebpackPlugin = new HtmlWebpackPlugin({
  template: path.join(__dirname, 'examples/basic/index.html'),
  filename: './index.html',
});

const config: webpack.Configuration = {
  entry: path.join(__dirname, 'examples/basic/index.js'),
  output: {
    path: path.join(__dirname, 'demo'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-typescript',
              '@babel/react',
            ],
            plugins: [
              '@babel/plugin-transform-runtime',
              // "@babel/plugin-proposal-class-properties",
              [
                '@babel/plugin-proposal-class-properties',
                {
                  loose: false,
                },
              ],
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [htmlWebpackPlugin],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  devServer: {
    port: 3000,
  },
  devtool: 'cheap-module-eval-source-map',
};

export default config;
