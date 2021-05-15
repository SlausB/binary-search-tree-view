
const path = require('path');
const fs = require("fs");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPartialsPlugin = require('html-webpack-partials-plugin');
const webpack = require('webpack');

function insert_html( path, location = "body" ) {
    if ( fs.existsSync(path) )
        return new HtmlWebpackPartialsPlugin({
            path: '../body.html',
            location,
        })
    return undefined
}

module.exports = (env, argv) => ({
    entry: './src/index.ts',
    optimization: {
        minimize: argv.mode == 'production',
    },

    devtool: argv.mode == 'production' ? undefined : 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.(tsx|ts)$/,
                use: {
                    loader : 'ts-loader',
                    //exclude: /node_modules/,
                    options: { allowTsInNodeModules: true },
                },
                include:[
                    path.join(__dirname, '.'),
                    path.join(__dirname, 'src'),
                ],
            },
        ],
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js', '.es6' ],
    },
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'dist'),
        clean : true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "binary-search-tree-view",
            filename: 'index.html',
            template: './src/index.html.ejs',
            hash: true,
            debug: argv.mode == 'development',
            favicon : 'favicon.ico',
        }),
        new webpack.DefinePlugin({
            NODE_ENV: JSON.stringify( argv.mode ),
        }),
    ],
});
