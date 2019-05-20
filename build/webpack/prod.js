const path = require("path");
const loaders = require("./loaders");
const preloaders = require("./preloaders");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

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
        minimize: false,
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
            'node_modules',                             // standard NPM modules
            path.resolve(__dirname, 'modules')          // non-NPM modules
        ],
        extensions: ['.ts', '.mjs', '.js', '.json'],    // try to resolve extension of require('module') in this order
    },
    externals: [ "WebSdk", /^angular/ ],
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
    module:{
//        preLoaders:preloaders,
        rules: loaders
    },
    // tslint: {
    //     emitErrors: true,
    //     failOnHint: true
    // }
};
