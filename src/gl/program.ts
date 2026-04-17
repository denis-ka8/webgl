import Resource, { ResourceOptions, WebGLResourceId } from "./resource";

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

	getVertexShader(): WebGLShader {
		return this._vertexShader;
	}

	getFragmentShader(): WebGLShader {
		return this._fragmentShader;
	}

	getProgram(): WebGLProgram | null {
		return this._program;
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
		if (success) {
			this.setId(this._program);
			return this._program;
		}

		console.warn(gl.getProgramInfoLog(this._program));
		gl.deleteProgram(this._program);
		this._program = null;
		return null;
	}

	protected _destroyGLResource(resource: WebGLResourceId): void {
		const gl = this._glContext;
		if (resource instanceof WebGLProgram) {
			gl.deleteProgram(resource);
		} else {
			console.warn("Program::_destroyGLResource()\n\tInvalid resource type");
		}
	}

	use(): void {
		if (!this.isValid()) {
			console.error("Program::use()\n\tCannot use program: resource is not valid");
			return;
		}
		const gl = this._glContext;
		gl.useProgram(this._program!);
	}

	getAttributeLocation(name: string): number {
		if (!this.isValid()) return -1;
		const gl = this._glContext;
		return gl.getAttribLocation(this._program!, name);
	}

	getUniformLocation(name: string): WebGLUniformLocation | null {
		if (!this.isValid()) return null;
		const gl = this._glContext;
		return gl.getUniformLocation(this._program!, name);
	}

	validate(): boolean {
		if (!this.isValid()) return false;

		const gl = this._glContext;
		gl.validateProgram(this._program!);
		const isValid = gl.getProgramParameter(this._program!, gl.VALIDATE_STATUS);
		if (!isValid) {
			console.warn(gl.getProgramInfoLog(this._program!));
		}
		return isValid;
	}
}

export default Program;