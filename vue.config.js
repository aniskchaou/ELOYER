module.exports = {
  // Disable parallel compilation (thread-loader) which breaks on Node 16+
  // with Vue CLI 4 / webpack 4 (project targets Node 14 per package.json engines)
  parallel: false,
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
};
