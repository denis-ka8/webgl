import Resource, { ResourceOptions, WebGLResourceId } from "./resource";

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
	private _source: string;

	constructor(options: ShaderOptions) {
		super(options);

		if (!options.shaderType)
			throw new Error("Shader::constructor()\n\tShader type is required to create shader");

		this._shaderType = options.shaderType;
	}

	getShaderType(): ShaderType {
		return this._shaderType;
	}

	getShader(): WebGLShader | null {
		return this._shader;
	}

	create(): WebGLShader | null {
		if (!this._source) {
			console.error("Shader::create()\n\tShader source is required");
			return false;
		}

		const gl = this._glContext;
		this._shader = gl.createShader(this._shaderType);
		if (!this._shader) {
			console.error("Shader::create()\n\tFailed to create shader object");
			return null;
		}

		gl.shaderSource(this._shader, this._source);
		gl.compileShader(this._shader);

		const success = gl.getShaderParameter(this._shader, gl.COMPILE_STATUS);
		if (success) {
			this.setId(this._shader);
			return this._shader;
		}

		console.warn(gl.getShaderInfoLog(this._shader));
		gl.deleteShader(this._shader);
		this._shader = null;
		return null;
	}

	protected _destroyGLResource(resource: WebGLResourceId): void {
		const gl = this._glContext;
		if (resource instanceof WebGLShader) {
			gl.deleteShader(resource);
		} else {
			console.warn("Shader::_destroyGLResource()\n\tInvalid resource type");
		}
	}

	// compile(source: string): boolean {
	// 	if (!source) {
	// 		console.error("Shader::compile()\n\tShader source is required");
	// 		return false;
	// 	}

	// 	this._source = source;
	// 	const compiledShader = this.create();
	// 	return compiledShader !== null;
	// }

	isValid(): boolean {
		return super.isValid() && this._shader !== null;
	}

	// TMP here
	async fetchFromUrl(url: string): Promise<string | null> {
		if (!url) {
			console.error("Resource::fetchFromUrl()\n\tURL is required to fetch resource");
			return null;
		}

		try {
			const response = await fetch(url);
			if (response.ok) {
				this._source = await response.text();
				return this._source || null;
			}

			throw new Error(`Status: ${response.status}, ${response.statusText}`);
		} catch (error: unknown) {
			console.error(`Resource::fetchFromUrl()\n\tError fetching resource from URL: ${url}\n\t${error instanceof Error ? error.message : String(error)}`);
		}
		return null;
	}
}

export default Shader;