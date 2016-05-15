/**
 * Created by pperala on 15/05/16.
 */
module.exports = {
    entry: './src/index.ts',
    output: {
        filename: 'dist/bundle.js'
    },
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
    },
    module: {
        loaders: [
            { test: /\.ts$/, loader: 'ts-loader' }
        ]
    }
}