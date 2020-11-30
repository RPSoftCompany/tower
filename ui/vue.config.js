module.exports = {
  outputDir: '../tower-server/client',
  productionSourceMap: false,
  parallel: 8,

  pwa: {
    workboxPluginMode: 'GenerateSW',
    skipWaiting: true,
    assetsVersion: '1.9.0',
  },
}
