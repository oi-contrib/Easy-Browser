const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        main: path.resolve(__dirname, '../src/modules/main/index.js'),
        painter: path.resolve(__dirname, '../src/modules/painter/index.js'),
    },
    output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "[name]/index.js",
    },
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
            filename: "index.html",
            template: path.resolve(__dirname, '../public/index.html'),
            chunks: ["main"],
        }),
        new HtmlWebpackPlugin({
            filename: "painter.html",
            template: path.resolve(__dirname, '../public/index.html'),
            chunks: ["painter"],
        })
    ],
    resolve: {
        extensions: ['.js', '.jsx'],
    }
};