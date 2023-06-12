/** @type {import('next').NextConfig} */
// const nextConfig = {};

module.exports = {
  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      poll: 300,
      aggregateTimeout: 300,
    };
    return config;
  },
};
