import Resource, { ResourceOptions } from "./resource";

interface ProgramOptions extends ResourceOptions {
	vertexShader: WebGLShader;
	fragmentShader: WebGLShader;
}

class Program extends Resource {

	private _vertexShader: WebGLShader;
	private _fragmentShader: WebGLShader;
	private _program: WebGLProgram | null = null;

	constructor(options: ProgramOptions) {
		super(options);

		if (!options.vertexShader)
			throw new Error("Program::constructor()\n\tVertex shader is required to create program");
    	if (!options.fragmentShader)
			throw new Error("Program::constructor()\n\tFragment shader is required to create program");

		this._vertexShader = options.vertexShader;
    	this._fragmentShader = options.fragmentShader;
	}

	get vertexShader(): WebGLShader {
		return this._vertexShader;
	}

	get fragmentShader(): WebGLShader {
		return this._fragmentShader;
	}

	create(): WebGLProgram | null {
		const gl = this._glContext;

		this._program = gl.createProgram();
		if (!this._program) {
			console.error("Program::create()\n\tFailed to create program object");
			return null;
		}

		gl.attachShader(this._program, this._vertexShader);
		gl.attachShader(this._program, this._fragmentShader);
		gl.linkProgram(this._program);

		const success = gl.getProgramParameter(this._program, gl.LINK_STATUS);
		if (success) return this._program;

		console.warn(gl.getProgramInfoLog(this._program));
		gl.deleteProgram(this._program);
		return null;
	}

	destroy(): void {
		const gl = this.glContext;
		if (this._program && gl) {
			gl.deleteProgram(this._program);
			this._program = null;
		}
	}

}

export default Program;