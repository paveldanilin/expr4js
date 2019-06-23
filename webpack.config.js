const path = require('path');

module.exports = {
    entry: './src/expr4.js',

    mode: "development",

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'expr4.js',
        library: "expr4",
        libraryTarget: "umd",
        umdNamedDefine: true,
        globalObject: "this"
    },

    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: "babel-loader"
                }
            }
        ]
    }
};
