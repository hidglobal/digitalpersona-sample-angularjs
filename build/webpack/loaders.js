const path = require("path");

// NOTICE: if you add here any additional resource loaders that will be used in Typescript imports,
// consider adding these resources into `@types/webpack-loade-imports.d.ts` file as well
// to prevent Typescript import errors.
//
module.exports = [
    { test: /\.ts(x?)$/     , loader: 'ts-loader'         },
    { test: /\.css$/        , loader: 'style-loader!css-loader'         },
    { test: /\.scss$/       , loader: 'style-loader!css-loader!sass-loader'    },

    { test: /\.html$/       , loader: 'raw-loader'             , exclude: /node_modules/ },
    { test: /\.png$/        , loader: 'url-loader'             , exclude: /node_modules/ },

    { test: /\.jpg$/        , loader: 'file-loader?name=[name].[hash:6].[ext]', exclude: /node_modules/ },

    {   test: /\.json$/,
        loader: "file-loader?name=[path][name].[ext]&context=src/",
        exclude: /node_modules/,
        type: 'javascript/auto'
    },
    {   test: /modules/,
        loader: "file-loader?name=[path][name].[ext]&context=src/",
        exclude: /node_modules/,
        type: 'javascript/auto'
    },
    {   test: /-shard1$/, loader: "file-loader?name=[path][name]&context=src/",  exclude: /node_modules/ },

    {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader?mimetype=image/svg+xml&name=[name].[hash:6].[ext]'},
    {test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: "file-loader?mimetype=application/font-woff&name=[name].[hash:6].[ext]"},
    {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "file-loader?mimetype=application/octet-stream&name=[name].[hash:6].[ext]"},
    {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file-loader?name=[name].[hash:6].[ext]"},
    // { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/    , loader: 'file-loader' },
    // { test: /\.ttf(\?v=[0-9]\.[0-9]\.[0-9])?$/              , loader: 'file-loader?mimetype=' },
    // { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/         , loader: 'url-loader?limit=10000&mimetype=application/font-woff' },
];
