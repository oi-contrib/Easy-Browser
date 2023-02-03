const config = require('./webpack.config');
const TimelinePlugin = require('../script/timeline-plug');

config.mode = "development";
config.devServer = {
    open: false,
    host: 'localhost',
    port: 3000,
    hot: true,
    compress: false,
    historyApiFallback: true,  // 解决react-router刷新404问题
};

config.plugins.push(new TimelinePlugin());

module.exports = config;