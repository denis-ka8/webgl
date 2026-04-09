import GLResource from "./resource"

class GLProgram extends GLResource {

	_vertexShader = null;
	_fragmentShader = null;

	constructor(options = {}) {
		super(options);
		this._vertexShader = options.vertexShader || this._vertexShader;
		this._fragmentShader = options.fragmentShader || this._fragmentShader;
	}

	get vertexShader() { return this._vertexShader; }

	get fragmentShader() { return this._fragmentShader; }

	create() {
		if (!this._vertexShader || !this._fragmentShader) {
			console.error("GLProgram::create()\n\tBoth vertex and fragment shaders are required to create program");
			return null;
		}

		const gl = this._glContext;

		const program = gl.createProgram();
		gl.attachShader(program, this._vertexShader);
		gl.attachShader(program, this._fragmentShader);
		gl.linkProgram(program);
		const success = gl.getProgramParameter(program, gl.LINK_STATUS);
		if (success) return program;

		console.warn(gl.getProgramInfoLog(program));
		gl.deleteProgram(program);
		return null;
	}

}

export default GLProgram;