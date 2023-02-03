const config = require('./webpack.config');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

config.mode = "production";
config.output = {
    path: path.resolve(__dirname, "../dist"),
    filename: "[name].[contenthash:10].js",
    chunkFilename: "[name].[contenthash:10].chunk.js",
    assetModuleFilename: "[hash:10][ext][query]",
    clean: true
};
config.optimization = {
    minimizer: [new TerserPlugin({
        extractComments: false
    })]
};

module.exports = config;