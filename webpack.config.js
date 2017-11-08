var path = require('path')
var webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
  context: path.join(__dirname, '/src'),
  entry: {
    main: ['./main.js']
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    // publicPath is important for webpack-dev-server to work and serve from memory INSTEAD of old builds from /dist/
    publicPath: '/dist/',
    filename: 'jqPropertyGrid.js',
    library: 'jqPropertyGrid',
    libraryTarget: 'var'
  },
  // these options are just for the dev-server launched w/ 'webpack-dev-server' from package.json
  // see more options @ https://webpack.js.org/configuration/dev-server/#devserver
  devServer: {
    inline: true,          // will inline HMR into JS files, instead of adding an iframe
    open: true,            // will open a web browser when launched
    watchContentBase: true // will cause static files to refresh to!
  },
  externals: [
    '$',
    'jQuery'
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpe?g|gif)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: '[name].[ext]?[hash]'
        }
      },
      {
        test: /\.(svg)(\?.*)?$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader'
        })
      }
    ]
  },
  resolve: {
    modules: [
      'node_modules'
    ],
    alias: {
      'root': path.resolve(__dirname, 'src/')
    }
  },
  devtool: '#eval-source-map',
  plugins: [
    new ExtractTextPlugin('jqPropertyGrid.css'),
    new webpack.ProvidePlugin({
      $: 'jQuery'
    })
  ]
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      comments: false,
      sourceMap: true,
      compress: {
        warnings: false,
        drop_console: true
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])
}
