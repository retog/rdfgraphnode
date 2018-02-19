// This library allows us to combine paths easily
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
//const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: path.resolve(__dirname, 'js', 'GraphNode.js'),
  output: {
    path: path.resolve(__dirname, 'distribution'),
    filename: 'GraphNode.js'
  },
  resolve: {
    extensions: ['.js']
  },
  module: {
    rules: [
      {
        test: /\.js/,
        use: {
          loader: 'babel-loader',
          options: { 
              presets: ['env'],
              "ignore": [
                "node_modules"
              ] 
            }
        },
        exclude: /node_modules/
        
      }
    ],
    loaders: [
        {
            test: /\.js[x]?$/,
            loader: 'babel-loader',
            exclude: /node_modules/
        }
    ]
  },
  externals: {
    'node-fetch': 'fetch',
    'xmldom': 'window',
    'rdflib' : '$rdf'
  },
  devtool: 'source-map'
};