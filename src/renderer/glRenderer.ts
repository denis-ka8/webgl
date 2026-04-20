import { Vec3, vec3 } from "../math/vec3";
import Camera from "../models/camera/camera";

export interface RendererOptions {
	glContext: WebGLRenderingContext;
}

export interface ObjectsDiff {
	additions: any[];
	updates: any[];
	removals: any[];
}

export interface IRenderer {
	setCamera(camera: Camera): void;
	setSize(width: number, height: number): void;
	clear(): void;
	useProgram(program: WebGLProgram): void;
	setUniforms(program: WebGLProgram, uniforms: Record<string, number | number[]>): void;
	drawArrays(mode: number, first: number, count: number): void;
	drawElements(mode: number, count: number, type: number, offset: number): void;
	updateLightUniforms(uniforms: Record<string, any>): void;
	// updateSceneObjects(objectsDiff: ObjectsDiff = { additions: [], updates: [], removals: [] }): void;
	render(): void;
}

class Renderer implements IRenderer {

	protected _glContext: WebGLRenderingContext;
	protected _camera: Camera;
	// TODO:
	protected _objects: any[] = [];

	protected _cameraPosition: Vec3 = vec3();
	protected _cameraUniforms: Record<string, any> = {};
	protected _lightUniforms: Record<string, any> = {};

	private _isInitialized: boolean = false;

	constructor(options: RendererOptions) {
		this._glContext = options.glContext;

		this._objects = [];

		this._cameraUniforms = {};
		this._lightUniforms = {};

		this._initGL();
		this._initResources();
	}

	private _initGL(): void {
		const gl = this._glContext;
		gl.clearColor(34 / 255, 40 / 255, 49 / 255, 1.0);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);

		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		gl.disable(gl.CULL_FACE);
	}

	protected async _initResources(): Promise<void> {
		// Override in subclass to initialize shaders, buffers, etc.
	}

	get isInitialized(): boolean {
        return this._isInitialized;
    }

    protected setInitialized(value: boolean): void {
        this._isInitialized = value;
    }

	setCamera(camera: Camera): void {
		this._camera = camera;
		
		this.updateCameraUniforms({
			uProjectionMatrix: camera.getProjectionMatrix(),
			uViewMatrix: camera.getViewMatrix(),
		});
		this.updateCameraPosition(camera.position);
	}

	setSize(width: number, height: number): void {
		// TODO: here? or in SceneView?
		// this._canvas.width = width;
		// this._canvas.height = height;
		this._glContext.viewport(0, 0, width, height);
	}

	clear(): void {
		const gl = this._glContext;
		gl.clearColor(34 / 255, 40 / 255, 49 / 255, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}

	updateSceneObjects(objectsDiff: ObjectsDiff = { additions: [], updates: [], removals: [] }): void {
		if (objectsDiff.additions.length) {
			this._objects = objectsDiff.additions; // TODO: tmp!
		}
	}

	updateCameraPosition(position: Vec3) {
		this._cameraPosition = position;
	}

	updateCameraUniforms(uniforms: Record<string, any>): void {
		this._cameraUniforms = uniforms;
	}

	updateLightUniforms(uniforms: Record<string, any>): void {
		this._lightUniforms = uniforms;
	}

	useProgram(program: WebGLProgram): void {
		this._glContext.useProgram(program);
	}

	setUniforms(program: WebGLProgram, uniforms: Record<string, number | number[]>): void {
		const gl = this._glContext;
		for (const [name, value] of Object.entries(uniforms)) {
			const location = gl.getUniformLocation(program, name);
			if (location === null) {
				console.warn(`Uniform ${name} not found in program`);
				continue;
			}
			if (typeof value === 'number') {
				if (Number.isInteger(value)) {
					gl.uniform1i(location, value);
				} else {
					gl.uniform1f(location, value);
				}
			} else if (value.length) {
				switch (value.length) {
					case 1: gl.uniform1iv(location, value); break;
					case 2: gl.uniform2fv(location, value); break;
					case 3: gl.uniform3fv(location, value); break;
					case 4: gl.uniform4fv(location, value); break;
					case 16: gl.uniformMatrix4fv(location, false, value); break;
					default: console.warn(`Unsupported uniform array length: ${value.length}`);
				}
			} else {
				console.warn(`Unsupported uniform type for ${name}`);
			}
		}
	}

	drawArrays(mode: number, first: number, count: number): void {
		this._glContext.drawArrays(mode, first, count);
	}
	
	drawElements(mode: number, count: number, type: number, offset: number): void {
		this._glContext.drawElements(mode, count, type, offset);
	}

	render(): void {
	}
}

export default Renderer;