const path = require("path");

// NOTICE: if you add here any additional resource loaders that will be used in Typescript imports,
// consider adding these resources into `@types/webpack-loade-imports.d.ts` file as well
// to prevent Typescript import errors.
//
module.exports = [
    { test: /\.ts(x?)$/     , use: ['ts-loader']        },
    { test: /\.css$/        , use: ['style-loader','css-loader']         },
    { test: /\.scss$/       , use: ['style-loader','css-loader','sass-loader']    },

    { test: /\.html$/       , use: ['raw-loader']             , exclude: /node_modules/ },
    { test: /\.png$/        , use: ['url-loader']             , exclude: /node_modules/ },

    { test: /\.jpg$/        ,
      use: [{
        loader: 'file-loader',
        options: {
          name: '[name].[hash:6].[ext]',
        },
      }],
      exclude: /node_modules/
    },
    {   test: /\.json$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]',
            context: 'src/',
          },
        }],
        exclude: /node_modules/,
        type: 'javascript/auto'
    },
    {   test: /modules/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]',
            context: 'src/',
          },
        }],
        exclude: /node_modules/,
        type: 'javascript/auto'
    },
    {   test: /-shard1$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[path][name]',
            context: 'src/',
          },
        }],
        exclude: /node_modules/
    },
    { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      use: [{
        loader: 'file-loader',
        options: {
          mimetype: 'image/svg+xml',
          name: '[name].[hash:6].[ext]',
        },
      }],
    },
    { test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
      use: [{
        loader: 'file-loader',
        options: {
          mimetype: 'application/font-woff',
          name: '[name].[hash:6].[ext]',
        },
      }],
    },
    { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
      use: [{
        loader: 'file-loader',
        options: {
          mimetype: 'application/octet-stream',
          name: '[name].[hash:6].[ext]',
        },
      }],
    },
    { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
      use: [{
        loader: 'file-loader',
        options: {
          name: '[name].[hash:6].[ext]',
        },
      }],
    },
    // { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/    , loader: 'file-loader' },
    // { test: /\.ttf(\?v=[0-9]\.[0-9]\.[0-9])?$/              , loader: 'file-loader?mimetype=' },
    // { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/         , loader: 'url-loader?limit=10000&mimetype=application/font-woff' },
];
