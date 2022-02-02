const path = require('path');

module.exports = {

    // bundling mode
    mode: 'production',

    // entry files
    entry: {
        player: './src/player/player.ts',
        host: './src/host/host.ts',
    },

    // output bundles (location)
    output: {
        path: path.resolve( __dirname, 'dist', 'server', 'scripts'),
        filename: '[name].js',
    },

    // file resolutions
    resolve: {
        extensions: [ '.ts', '.js' ],
    },

    // loaders
    module: {
        rules: [
            {
                test: /\.tsx?/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ]
    }
};