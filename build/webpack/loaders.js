const path = require("path");

// NOTICE: if you add here any additional resource loaders that will be used in Typescript imports,
// consider adding these resources into `@types/webpack-loade-imports.d.ts` file as well
// to prevent Typescript import errors.
//
module.exports = [
    { test: /\.ts(x?)$/     , use: [ 'ts-loader' ]},
    { test: /\.css$/        , use: [ 'style-loader', 'css-loader']},
    { test: /\.scss$/       , use: [ 'style-loader', 'css-loader', 'sass-loader']},

    { test: /\.html$/       , type: 'asset/resource'    , exclude: /node_modules/ },
    { test: /\.png$/        , type: 'asset/inline'      , exclude: /node_modules/ },

    { test: /\.jpg$/      , type: 'asset/resource'    , exclude: /node_modules/ },

    { test: /modules/     , type: 'javascript/auto'   , exclude: /node_modules/,
        generator: { filename: '[path][name].[ext]' }
    },
    { test: /-shard1$/    , type: 'asset/resource'    , exclude: /node_modules/,
        generator: { filename: '[path][name]' },
    },

    { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/  , type: 'asset/resource',
        mimetype: 'image/svg+xml',
    },
    { test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/    , type: 'asset/resource', mimetype: 'application/font-woff' },
    { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/             , type: 'asset/resource', mimetype: 'application/octet-stream' },
    { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/             , type: 'asset/resource' }
];
