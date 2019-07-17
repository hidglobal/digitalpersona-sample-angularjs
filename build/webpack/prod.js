const path = require("path");
const loaders = require("./loaders");
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const config = require('../../server/config');

module.exports = {
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
        // new webpack.optimize.UglifyJsPlugin(
        //     {
        //         warning: false,
        //         mangle: true,
        //         comments: false
        //     }
        // ),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            inject: 'body',
            hash: true
        }),
        // new webpack.ProvidePlugin({
        //     $: 'jquery',
        //     jQuery: 'jquery',
        //     'window.jQuery': 'jquery',
        //     'window.jquery': 'jquery'
        // })
        new webpack.HashedModuleIdsPlugin(),
    ],
    resolveLoader: {
        alias: {
            copy: 'file-loader?name=[path][name].[ext]&context=src/'
        }
    },
    module:{
        rules: loaders
    },
    // tslint: {
    //     emitErrors: true,
    //     failOnHint: true
    // }
};
