const config = require('./webpack.config');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

config.mode = "production";
config.output = {
    path: path.resolve(__dirname, "../dist"),
    filename: "[name].js",
    chunkFilename: "bundle/[name].js",
    assetModuleFilename: "images/[name][ext]",
    clean: true
};
config.optimization = {
    minimizer: [new TerserPlugin({
        extractComments: false
    })]
};

module.exports = config;