const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
	mode: 'development',
	entry: './src/index.ts',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist'),
	},
	devtool: 'eval-source-map',
	devServer: {
		static: {
			directory: path.join(__dirname, 'dist'),
		},
		// compress: true,
		port: 8080,
	},
	plugins: [
		new CopyPlugin({
			patterns: [{ from: 'src/assets', to: 'assets' }],
		}),
		new HtmlWebpackPlugin({
			template: './src/index.html',
		}),
	],
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
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
