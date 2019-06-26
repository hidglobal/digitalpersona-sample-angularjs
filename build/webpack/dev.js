const path = require("path");
const loaders = require("./loaders");
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const config = require('../../server/config');

module.exports = {
    devtool: "inline-eval-cheap-source-map",
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
        https: true,
        pfx: config.site.sslCertificate.pfxFilename,
        pfxPassphrase: config.site.sslCertificate.passphrase,
        publicPath: '/',
        historyApiFallback: true,
        contentBase: [
            'out/public/'
        ],
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
