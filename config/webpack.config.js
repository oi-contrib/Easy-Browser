const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: path.resolve(__dirname, '../src/main.js'),
    module: {
        rules: [
            {
                oneOf: [  // 表示当匹配到一个规则的时候，就不再匹配其他的了
                    {
                        test: /\.(js|jsx)$/,
                        include: [
                            path.resolve(__dirname, '../src')
                        ],
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: true, // 开缓存
                            cacheCompression: false, // 关闭缓存压缩
                        },
                    }, {
                        test: /\.(scss|css)$/,
                        use: ['style-loader', 'css-loader', 'sass-loader']
                    }
                ],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../public/index.html'),
        })
    ],
    resolve: {
        extensions: ['.js', '.jsx'],
    }
};