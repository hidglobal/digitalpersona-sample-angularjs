const path = require("path");
const loaders = require("./loaders");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const config = require('../../server/config');

module.exports = {
    mode: "production",
    devtool: 'source-map',
    entry: {
        main: "./src/index.ts",     // main application page
                                    // TODO: add more entries here, one per each reloadable page
    },
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve('out/public'),
    },
    optimization: {
        minimize: true,
        runtimeChunk: 'single',
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                }
            },
        },
    },
    resolve: {
        modules: [
            path.resolve(__dirname, "src/modules"),
            'node_modules',                             // standard NPM modules
            'modules',            // non-NPM modules
        ],
        fallback: {
            fs: false,
            crypto: false,  // temp workaroud, WebSDK uses a shim that depends on `crypto`
            vertx: false    // temp workaroud, WebSDK uses a shim that depends on `vertx`
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
        publicPath: '/',
        historyApiFallback: true,
        static: [
            { directory: "out/public", publicPath: "/" }
        ]    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            inject: 'body',
            base: '/',
            hash: true
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'modules/**/*.js', context: 'src/' },
                { from: 'locales/*.json', context: 'src/' },
            ]
        }),
    ],
    module:{
        rules: loaders
    },
};
