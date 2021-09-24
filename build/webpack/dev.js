const path = require("path");
const loaders = require("./loaders");
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const config = require('../../server/config');

module.exports = {
    devtool: "inline-cheap-source-map",
    entry: {
        main: "./src/index.ts",     // main application page
                                    // TODO: add more entries here, one per each reloadable page
    },
    output: {
        filename: '[name].js',
        path: path.resolve('out/public'),
    },
    resolve: {
        modules: [
            path.resolve(__dirname, "src/modules"),
            'node_modules',       // standard NPM modules
            'modules',            // non-NPM modules
        ],
        fallback: {
          fs: false
        },
        extensions: [ '.ts', '.mjs', '.js' ],    // try to resolve extension of require('module') in this order
    },
    externals: [
        { WebSdk: {
            root: "WebSdk"
        }},
        { faceapi: {
            root: "face-api.js"
        }},
        { qrcode: {
            root: 'qrcode-generator',
        }}
    ],
    devServer: {
        host: config.site.host,
        port: config.site.port,
        https: {
          pfx: config.site.sslCertificate.pfxFilename,
          pfxPassphrase: config.site.sslCertificate.passphrase,
        },
        //devMiddleware: {
        //  publicPath: '/'
        //},
        historyApiFallback: true,
        //contentBase: [
        static : [{
            directory : 'out/public/',
            publicPath: '/'
        }],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            inject: 'body',
            hash: true
        }),
        new BrowserSyncPlugin({
            host: config.site.host,
            port: config.site.port + 4000,
            proxy: `https://${config.site.host}:${config.site.port}`,
            ui: false,
            online: false,
            notify: false,
            reload: false,
        }),
    ],
    resolveLoader: {
        alias: {
            copy: 'file-loader?name=[path][name].[ext]&context=src/'
        }
    },
    module:{
        rules: loaders
    }
};
