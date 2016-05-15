module.exports = {
    entry: './src/index.ts',
    target: 'node',
    output: {
        filename: 'dist/bundle.js'
    },
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
    },
    module: {
        loaders: [
            { test: /\.ts$/, loader: 'ts-loader' },
            { test: /\.json$/, loader: 'json-loader'}
        ]
    }
}