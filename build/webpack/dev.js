const path = require("path");
var loaders = require("./loaders");
var BrowserSyncPlugin = require('browser-sync-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');

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
        host: 'bank.alpha.local',
        port: 443,
        https: true,
        pfx: 'certificates/wildcard-alpha-local.pfx',
        pfxPassphrase: 'test',
        publicPath: '/',
        // proxy: {
        //     '/' : {
        //         target: "bank.alpha.local",
        //         pathRewrite: { '^/\.+': '' }
        //     },
        // },
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
            host: 'bank.alpha.local',
            port: 4443,
            proxy: "https://bank.alpha.local:443",
            //  {
            //     '*' : {
            //         target: "https://bank.alpha.local:8080/",
            //         pathRewrite: { '*': ''}
            //     },
            // },
            // server: {
            //     baseDir: path.resolve('out/public')
            // },
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
