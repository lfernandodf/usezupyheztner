/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://quasar.dev/quasar-cli/quasar-conf-js
/* eslint-env node */

module.exports = function (ctx) {
  require('dotenv').config()
  return {
    // https://quasar.dev/quasar-cli/supporting-ts
    // supportTS: false,

    // https://quasar.dev/quasar-cli/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://quasar.dev/quasar-cli/boot-files
    boot: [
      'vuelidate',
      'ccComponents'
    ],

    // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-css
    css: [
      'app.sass'
    ],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      'mdi-v5',
      // 'fontawesome-v5',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      'roboto-font', // optional, you are not bound to it
      'material-icons' // optional, you are not bound to it
    ],

    // Full list of options: https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-build
    build: {
      env: {
        VUE_URL_API: process.env.VUE_URL_API,
        VUE_FACEBOOK_APP_ID: process.env.VUE_FACEBOOK_APP_ID
      },
      vueRouterMode: 'hash', // available values: 'hash', 'history'

      // transpile: false,

      // Add dependencies for transpiling with Babel (Array of string/regex)
      // (from node_modules, which are by default not transpiled).
      // Applies only if "transpile" is set to true.
      // transpileDependencies: [],

      // rtl: false, // https://quasar.dev/options/rtl-support
      // preloadChunks: true,
      // showProgress: false,
      // gzip: true,
      // analyze: true,

      // Options below are automatically set depending on the env, set them if you want to override
      // extractCSS: false,

      // https://quasar.dev/quasar-cli/handling-webpack
      extendWebpack (cfg) {
        cfg.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /node_modules/,
          options: {
            devtool: 'source-map',
            preventExtract: true
          }
        })
        cfg.devtool = 'source-map'
      }
    },

    // Full list of options: https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-devServer
    devServer: {
      https: false,
      // port: 8080,
      open: true // opens browser window automatically
    },

    // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-framework
    framework: {
      iconSet: 'material-icons', // Quasar icon set
      lang: 'pt-br',
      config: {
        dark: false
      },
      directives: ['Ripple', 'ClosePopup'],
      // Possible values for "importStrategy":
      // * 'auto' - (DEFAULT) Auto-import needed Quasar components & directives
      // * 'all'  - Manually specify what to import
      importStrategy: 'auto',

      // For special cases outside of where "auto" importStrategy can have an impact
      // (like functional components as one of the examples),
      // you can manually specify Quasar components/directives to be available everywhere:
      //
      // components: [],
      // directives: [],

      // Quasar plugins
      plugins: ['Notify', 'Dialog', 'LocalStorage']
    },

    animations: 'all', // --- includes all animations
    // https://quasar.dev/options/animations
    // animations: [],

    // https://quasar.dev/quasar-cli/developing-ssr/configuring-ssr
    ssr: {
      pwa: false
    },

    // https://quasar.dev/quasar-cli/developing-pwa/configuring-pwa
    pwa: {
      workboxPluginMode: 'GenerateSW', // 'GenerateSW' or 'InjectManifest'
      workboxOptions: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
      }, // only for GenerateSW
      manifest: {
        name: 'Usezupy',
        short_name: 'Usezupy',
        description: 'Bot Multi-atendimento para whatsapp',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          {
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      metaVariablesFn (manifest) {
        return [
          {
            tagName: 'meta',
            attributes: {
              name: 'theme-color',
              content: manifest.theme_color
            }
          },
          {
            tagName: 'meta',
            attributes: {
              name: 'mobile-web-app-capable',
              content: 'yes'
            }
          },
          {
            tagName: 'meta',
            attributes: {
              name: 'apple-mobile-web-app-status-bar-style',
              content: 'default'
            }
          },
          {
            tagName: 'meta',
            attributes: {
              name: 'apple-mobile-web-app-title',
              content: manifest.name
            }
          },
          {
            tagName: 'link',
            attributes: {
              rel: 'apple-touch-icon',
              href: 'icons/apple-icon-120x120.png'
            }
          },
          {
            tagName: 'link',
            attributes: {
              rel: 'apple-touch-icon',
              sizes: '152x152',
              href: 'icons/apple-icon-152x152.png'
            }
          },
          {
            tagName: 'link',
            attributes: {
              rel: 'apple-touch-icon',
              sizes: '167x167',
              href: 'icons/apple-icon-167x167.png'
            }
          },
          {
            tagName: 'link',
            attributes: {
              rel: 'apple-touch-icon',
              sizes: '180x180',
              href: 'icons/apple-icon-180x180.png'
            }
          },
          {
            tagName: 'link',
            attributes: {
              rel: 'mask-icon',
              href: 'icons/safari-pinned-tab.svg',
              color: manifest.theme_color
            }
          },
          {
            tagName: 'meta',
            attributes: {
              name: 'msapplication-TileImage',
              content: 'icons/ms-icon-144x144.png'
            }
          },
          {
            tagName: 'meta',
            attributes: {
              name: 'msapplication-TileColor',
              content: '#000000'
            }
          }
        ]
      },
      extendWebpack (/* cfg */) {
        // do something with Electron main process Webpack cfg
        // chainWebpack also available besides this extendWebpack
      }
    }
  }
}
