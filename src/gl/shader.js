import GLResource from "./resource";

class GLShader extends GLResource {

	_shaderType = null;

	constructor(options = {}) {
		super(options);

		if (!options.shaderType) console.error("GLShader::constructor()\n\tShader type is required to create shader");

		this._shaderType = options.shaderType || this._shaderType;
	}

	get shaderType() { return this._shaderType; }

	create(source) {
		if (!source) {
			console.error("GLShader::create()\n\tShader source is required to create shader");
			return null;
		}

		const gl = this._glContext;

		const shader = gl.createShader(this._shaderType);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
		if (success) return shader;

		console.warn(gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
}

export default GLShader;