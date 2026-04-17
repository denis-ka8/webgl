import Renderer, { RendererOptions, ObjectsDiff } from "./glRenderer";
import Program from "../gl/program";
import Shader from "../gl/shader";
import Geometry from "../gl/geometry";
import Buffer from "../gl/buffer";
import Texture from "../gl/texture";

class CubeRenderer extends Renderer {

	// TODO:
	private _cameraUniforms: Record<string, any> = {};
	private _cubeProgram: WebGLProgram | null = null;
	private _cubePositionLocation: number | null = null;
	private _cubeTexCoordLocation: number | null = null;
	private _cubeNormalLocation: number | null = null;
	private _cubeVertexBuffer: WebGLBuffer | null = null;
	private _indicesBuffer: WebGLBuffer | null = null;
	private _cubeTexture: WebGLTexture | null = null;
	private _cubeVertexCount: number = 0;
	private _indCount: number = 0;
	private _inited: boolean = false;

	constructor(options: RendererOptions) {
		super(options);

		this._cameraUniforms = {};
	}

	// updateSceneObjects(objectsDiff: ObjectsDiff = { additions: [], updates: [], removals: [] }): void {
	// 	// TODO: handle additions, updates and removals
	// 	if (objectsDiff.additions.length) {
	// 		this._objects = objectsDiff.additions; // TODO: tmp!
	// 	}
	// }

	updateCameraUniforms(uniforms: Record<string, any>): void {
		this._cameraUniforms = uniforms;
	}

	async _initResources(): Promise<void> {
		const gl = this._glContext;

		// TODO: realize isValid() for all resources

		// Create shaders
		const vsCubeResource = new Shader({ glContext: gl, shaderType: gl.VERTEX_SHADER });
		const vsCubeSource = await vsCubeResource.fetchFromUrl('./assets/shaders/cube.vs');
		if (!vsCubeSource) {
			console.error('CubeRenderer::_initResources() - Failed to load vertex shader source');
			return;
		}
		const cubeVertexShader = vsCubeResource.create(vsCubeSource);
		if (!cubeVertexShader) return;

		const fsCubeResource = new Shader({ glContext: gl, shaderType: gl.FRAGMENT_SHADER });
		const fsCubeSource = await fsCubeResource.fetchFromUrl('./assets/shaders/cube.fs');
		if (!fsCubeSource) {
			console.error('CubeRenderer::_initResources() - Failed to load fragment shader source');
			return;
		}
		const cubeFragmentShader = fsCubeResource.create(fsCubeSource);
		if (!cubeFragmentShader) return;

		// Create program
		const cubeProgramObj = new Program({ glContext: gl, vertexShader: cubeVertexShader, fragmentShader: cubeFragmentShader });
		this._cubeProgram = cubeProgramObj.create();
		if (!this._cubeProgram) return;

		this._cubePositionLocation = gl.getAttribLocation(this._cubeProgram, "aPosition");
		this._cubeTexCoordLocation = gl.getAttribLocation(this._cubeProgram, "aTexCoord");
		this._cubeNormalLocation = gl.getAttribLocation(this._cubeProgram, "aNormal");

		const geometryObj = new Geometry({ glContext: gl });
		const geometrySource = await geometryObj.fetchFromUrl('./assets/geometry/cube.obj');
		if (!geometrySource) return;
		const geometryBuffer = geometryObj.create(geometrySource);
		if (!geometryBuffer) return;
		this._cubeVertexCount = geometryObj.vertexCount;

		const vertexBuffer = new Buffer({ glContext: gl });
		this._cubeVertexBuffer = vertexBuffer.create(geometryBuffer);

		const indicesBuffer = new Buffer({ glContext: gl });
		this._indicesBuffer = indicesBuffer.create(new Uint16Array(geometryObj.indices), gl.ELEMENT_ARRAY_BUFFER);
		this._indCount = geometryObj.indicesCount;

		const textureObj = new Texture({ glContext: gl });
		this._cubeTexture = textureObj.create();
		if (!this._cubeTexture) return;
		gl.bindTexture(gl.TEXTURE_2D, this._cubeTexture);

		// TODO: not here
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		await textureObj.loadFromUrl('./assets/textures/cube.png', this._cubeTexture);

		this._inited = true;
	}

	render(): void {
		// TODO: realize resource ready state and render only when resources are loaded
		if (!this._camera) return; // Resources not initialized yet
		if (!this._inited) return; // Resources not initialized yet

		const gl = this._glContext;

		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		this.clear();
		// gl.enable(gl.CULL_FACE);
		gl.enable(gl.DEPTH_TEST);

		// TODO: realize isValid()
		if (this._cubeProgram == null) return;
		if (this._cubePositionLocation == null) return;
		if (this._cubeTexCoordLocation == null) return;
		if (this._cubeNormalLocation == null) return;

		gl.useProgram(this._cubeProgram);
		// TODO: calculate matrices only when camera moves and cache them
		this.setUniforms(this._cubeProgram, {
			uProjectionMatrix: this._camera.getProjectionMatrix(),
			uViewMatrix: this._camera.getViewMatrix(),
			...this._lightUniforms
		});

		const stride = (3 + 2 + 3) * 4;
		gl.bindBuffer(gl.ARRAY_BUFFER, this._cubeVertexBuffer);
		gl.enableVertexAttribArray(this._cubePositionLocation);
		gl.vertexAttribPointer(this._cubePositionLocation, 3, gl.FLOAT, false, stride, 0);

		gl.enableVertexAttribArray(this._cubeTexCoordLocation);
		gl.vertexAttribPointer(this._cubeTexCoordLocation, 2, gl.FLOAT, false, stride, 3 * 4);

		gl.enableVertexAttribArray(this._cubeNormalLocation);
		gl.vertexAttribPointer(this._cubeNormalLocation, 3, gl.FLOAT, false, stride, (3 + 2) * 4);




		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indicesBuffer);

		const indexCount = this._indCount;
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this._cubeTexture);
		this.setUniforms(this._cubeProgram, {
			uTexture: 0
		});

		for (const drawable of this._objects) {
			this.setUniforms(this._cubeProgram, {
				uModelPosition: drawable.model.position,
			});
			gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);
		}
	}

}

export default CubeRenderer;