//      

import webpack from 'webpack';
import middleware from 'webpack-dev-middleware';
import express from 'express';
import http from 'http';
import webpackConfig from '../webpack.config';

export function timeout(ms        )                {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function launchApp()                 {
  const compiler = webpack({
    ...webpackConfig,
    mode: 'none',
    watch: false,
  });
  const app = express();

  app.use(middleware(compiler, {
    // webpack-dev-middleware options
  }));

  return new Promise((resolve) => {
    const server = http.createServer(app).listen(3000, () => {
      resolve(server);
    });
  });
}
