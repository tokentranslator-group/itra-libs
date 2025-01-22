const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
	filename: 'main.js',
	path: path.resolve(__dirname, 'build'),
    },
    mode: 'development',
    resolve: {
	modules:['/usr/local/storage/envs/nodejs_v17.9.1/lib/node_modules', 'node_modules'],
	extensions: ['.js', '.jsx', '.json']
	
    },
    resolveLoader:{
	modules:['/usr/local/storage/envs/nodejs_v17.9.1/lib/node_modules', 'node_modules'],
	extensions: ['.js', '.jsx', '.json']
    },
    
    module: {
	rules: [
	    {
		test: /\.(png|jpg|gif)$/i,
		use: [
		    {
			loader: 'url-loader',
			options: {
			    limit: 8192,
			},
		    },
		],
	    },

	    {
		test: /\.css$/,
		use: [
		    {loader: 'style-loader'},
		    {loader: 'css-loader'},
		],
	    },
	    {
		test: /\.(js|jsx)$/,
		options: {
		    presets: ["@babel/preset-env","@babel/preset-react"].map(require.resolve)
		},
		loader:'babel-loader'

		//exclude: /node_modules/,
		//use: 'babel-loader'
	    },

	],
    },
  
    devServer: {
	port: '8889',
	static: {
	    directory: path.join(__dirname, 'build')
	},

	headers:{
	    "Access-Control-Allow-Origin": "*",
	    'Access-Control-Allow-Credentials': true,
	    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
	    'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Ver'
	},

	open: false,
	hot: true,
	liveReload: true,
    },
    
};
