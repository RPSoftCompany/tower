module.exports = {
  outputDir: '../tower-server/client',
  productionSourceMap: false,
  parallel: 8,
  publicPath: '/ui/',

  pwa: {
    workboxPluginMode: 'GenerateSW',
    skipWaiting: true,
    assetsVersion: '1.10.0',
  },
}
