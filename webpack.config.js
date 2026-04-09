const path = require('path');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
	mode: 'development',
	entry: './src/index.js',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist'),
		// assetModuleFilename: 'assets/[name][ext]'
	},
	// plugins: [new HtmlWebpackPlugin()],
	devtool: 'eval-source-map',
	mode: 'development',
	devServer: {
		static: {
			directory: path.join(__dirname, 'dist'),
		},
		// compress: true,
		port: 9000,
	},
	plugins: [
		new CopyPlugin({
			patterns: [{ from: 'src/assets', to: 'assets' }],
		}),
	],
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader'],
			},
			// {
			// 	test: /\.(fs|vs)$/i,
			// 	type: 'asset/resource', // Копирует файл в output.path
			// },
		],
	}
};
