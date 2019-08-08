const Path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './examples/sandbox/sandbox.js',
    mode: 'development',

    output: {
        path: Path.resolve(__dirname, 'dist'),
        filename: 'sandbox.js',
        libraryTarget: "umd",
        umdNamedDefine: true,
        globalObject: "this"
    },

    devServer: {
        contentBase: Path.join(__dirname, 'dist'),
        compress: true,
        port: 9000
    },

    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    'css-loader'
                ],
            },
        ]
    },

    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css',
            ignoreOrder: false
        }),
        new HtmlWebpackPlugin({
            template: './examples/sandbox/index.html',
            hash: true,
            inject: false
        }),
    ],
};


