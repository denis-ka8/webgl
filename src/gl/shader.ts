import Resource, { ResourceOptions } from "./resource";

enum ShaderType {
	Vertex = 0x8B31, // gl.VERTEX_SHADER
	Fragment = 0x8B30 // gl.FRAGMENT_SHADER
}

interface ShaderOptions extends ResourceOptions {
	shaderType: ShaderType;
}

class Shader extends Resource {

	private _shaderType: ShaderType;
	private _shader: WebGLShader | null = null;

	constructor(options: ShaderOptions) {
		super(options);

		if (!options.shaderType)
			throw new Error("Shader::constructor()\n\tShader type is required to create shader");

		this._shaderType = options.shaderType;
	}

	get shaderType(): ShaderType {
		return this._shaderType;
	}


	create(source: string): WebGLShader | null {
		if (!source) {
			console.error("Shader::create()\n\tShader source is required to create shader");
			return null;
		}

		const gl = this._glContext;
		this._shader = gl.createShader(this._shaderType);
		if (!this._shader) {
			console.error("Shader::create()\n\tFailed to create shader object");
			return null;
		}

		gl.shaderSource(this._shader, source);
		gl.compileShader(this._shader);
		const success = gl.getShaderParameter(this._shader, gl.COMPILE_STATUS);
		if (success) return this._shader;

		console.warn(gl.getShaderInfoLog(this._shader));
		gl.deleteShader(this._shader);
		return null;
	}

	destroy(): void {
		const gl = this._glContext;
		if (this._shader && gl) {
			gl.deleteShader(this._shader);
			this._shader = null;
		}
	}
}

export default Shader;