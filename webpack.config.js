/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

module.exports = [
    {
        mode: 'production',
        entry: './src/index.ts',
        output: {
            path: path.resolve(__dirname, 'dist', 'web'),
            filename: 'hmd2html.min.js',
            library: 'hmd2html',
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
            ],
        },
        optimization: {
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    parallel: true,
                    terserOptions: {
                        mangle: true,
                        compress: {}
                    },
                }),
            ]
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs'],
            fallback: {
                fs: false,
                path: false,
                // path: require.resolve('path-browserify'),
            },
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_DEBUG': false,
            }),
        ]
    },
    {
        mode: 'development',
        entry: './src/index.ts',
        output: {
            path: path.resolve(__dirname, 'dist', 'web'),
            filename: 'hmd2html.js',
            library: 'hmd2html',
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
            ],
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs'],
            fallback: {
                fs: false,
                path: false,
                // path: require.resolve('path-browserify'),
            },
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_DEBUG': true,
            }),
        ]
    }
];
