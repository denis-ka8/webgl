const path = require('path');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
	mode: 'development',
	entry: './src/index.ts',
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
	resolve: {
		extensions: ['.tsx', '.ts', '.js'], // порядок разрешения расширений
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
