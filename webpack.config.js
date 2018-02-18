// This library allows us to combine paths easily
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
//const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: path.resolve(__dirname, 'js', 'GraphNode.js'),
  output: {
    path: path.resolve(__dirname, 'distribution'),
    filename: 'GraphNode.js',
    libraryTarget: 'var',
    library: 'GraphNode'
  },
  module: {
    rules: [
      {
        test: /\.js/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { 
              presets: ['env']
            }
        }
      }
    ],
  },
  externals: {
    'node-fetch': 'fetch',
    'xmldom': 'window',
    'rdflib' : '$rdf'
  },
  devtool: 'source-map'
};