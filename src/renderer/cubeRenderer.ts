import Renderer, { RendererOptions, ObjectsDiff } from "./glRenderer";
import Program from "../gl/program";
import Shader from "../gl/shader";
import Geometry from "../gl/geometry";
import GLBuffer from "../gl/buffer";
import Environment from "../gl/environment";
import CubeMap from "../gl/cubeMap";
import Texture from "../gl/texture";
import Material, { TextureSlot } from "../gl/material";
import Color from "../utils/color";

class CubeRenderer extends Renderer {

	// TODO:
	private _cubeProgram: WebGLProgram | null = null;
	private _cubePositionLocation: number | null = null;
	private _cubeTexCoordLocation: number | null = null;
	private _cubeNormalLocation: number | null = null;
	private _cubeVertexBuffer: WebGLBuffer | null = null;
	private _environmentMapLoc: WebGLUniformLocation | null = null;
	private _indicesBuffer: WebGLBuffer | null = null;
	private _cubeMap: CubeMap | null = null;
	private _material: Material | null = null;
	private _indCount: number = 0;

	constructor(options: RendererOptions) {
		super(options);
	}

	// updateSceneObjects(objectsDiff: ObjectsDiff = { additions: [], updates: [], removals: [] }): void {
	// 	// TODO: handle additions, updates and removals
	// 	if (objectsDiff.additions.length) {
	// 		this._objects = objectsDiff.additions; // TODO: tmp!
	// 	}
	// }

	async _initResources(): Promise<void> {
		const gl = this._glContext;

		// TODO: realize isValid() for all resources

		// Create shaders
		const vsCubeResource = new Shader({ glContext: gl, shaderType: gl.VERTEX_SHADER });
		await vsCubeResource.fetchFromUrl('./assets/shaders/cube.vs');
		const cubeVertexShader = vsCubeResource.create();
		if (!cubeVertexShader) return;

		const fsCubeResource = new Shader({ glContext: gl, shaderType: gl.FRAGMENT_SHADER });
		await fsCubeResource.fetchFromUrl('./assets/shaders/cube.fs');
		const cubeFragmentShader = fsCubeResource.create();
		if (!cubeFragmentShader) return;

		// Create program
		const cubeProgramObj = new Program({ glContext: gl, vertexShader: cubeVertexShader, fragmentShader: cubeFragmentShader });
		this._cubeProgram = cubeProgramObj.create();
		if (!this._cubeProgram) return;

		this._cubePositionLocation = gl.getAttribLocation(this._cubeProgram, "aPosition");
		this._cubeTexCoordLocation = gl.getAttribLocation(this._cubeProgram, "aTexCoord");
		this._cubeNormalLocation = gl.getAttribLocation(this._cubeProgram, "aNormal");

		// Create geometry
		const geometryObj = new Geometry({ glContext: gl });
		// const geometrySource = await geometryObj.fetchFromUrl('./assets/geometry/cube.obj');
		const geometrySource = await geometryObj.fetchFromUrl('./assets/geometry/sphere.obj');
		if (!geometrySource) return;
		if (!geometryObj.parseSource(geometrySource)) return;
		const geometryBuffer = geometryObj.create();
		if (!geometryBuffer) return;

		// Create vertex and index buffers
		const vertexBuffer = new GLBuffer({ glContext: gl });
		vertexBuffer.setData(geometryObj.getVertices().buffer);
		this._cubeVertexBuffer = vertexBuffer.create();

		const indicesBuffer = new GLBuffer({ glContext: gl, type: gl.ELEMENT_ARRAY_BUFFER });
		indicesBuffer.setData(geometryObj.getIndices().buffer);
		this._indicesBuffer = indicesBuffer.create();
		this._indCount = geometryObj.getIndicesCount();

		// Environment
		const environment = new Environment({ glContext: gl });
		this._cubeMap = await environment.loadFromPaths([
			"./assets/textures/px.png",
			"./assets/textures/nx.png",
			"./assets/textures/py.png",
			"./assets/textures/ny.png",
			"./assets/textures/pz.png",
			"./assets/textures/nz.png",
		]);
		this._environmentMapLoc = gl.getUniformLocation(this._cubeProgram, 'uEnvironmentMap');
		if (this._environmentMapLoc === null) {
			console.warn('Uniform uEnvironmentMap not found in shader program');
		}


		// Create materal
		const metalMaterial = new Material({ glContext: gl });
		metalMaterial.setBaseColor(new Color(0.8, 0.8, 0.9));
		metalMaterial.setMetallic(0.9);
		metalMaterial.setRoughness(0.2);

		// Create texture
		// const normalTexture = new Texture({ glContext: gl });
		// normalTexture.create();
		// normalTexture.initializeWithDefaults()

		const aoTexture = new Texture({ glContext: gl });
		aoTexture.create();
		// aoTexture.initializeWithDefaults()

		// const roughnessTexture = new Texture({ glContext: gl });
		// roughnessTexture.create();
		// roughnessTexture.initializeWithDefaults()

		// await normalTexture.loadFromUrl("./assets/textures/normal.jpg");
		await aoTexture.loadFromUrl("./assets/textures/ao.jpg");
		// await roughnessTexture.loadFromUrl("./assets/textures/roughness.jpg");

		// metalMaterial.setTexture("normal", normalTexture);
		metalMaterial.setTexture("ao", aoTexture);
		// metalMaterial.setTexture("roughness", roughnessTexture);

		// normalTexture.bind(0);
		// normalTexture.uploadImage(true);
		// normalTexture.configureTexture();

		if (metalMaterial?.isValid()) {

			const textureSlots: TextureSlot[] = [
				// "normal",
				"ao",
				// "roughness",
			];

			textureSlots.forEach((slot, index) => {
				const texture = metalMaterial!.getTexture(slot);

				if (texture?.isValid()) {
					texture.bind(index);
					texture.uploadImage(true);
					texture.configureTexture();
				} else {
					console.warn(`Texture slot '${slot}' is missing or invalid`);
				}
			});
		}

		this._material = metalMaterial;

		this.setInitialized(true);
	}

	render(): void {
		if (!this.isInitialized || !this._camera) return;

		const gl = this._glContext;

		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		this.clear();
		// gl.enable(gl.CULL_FACE);
		gl.enable(gl.DEPTH_TEST);

		this._updateFPS();
		this._displayFPS();

		// TODO: realize isValid()
		if (this._cubeProgram == null) return;
		if (this._cubePositionLocation == null) return;
		if (this._cubeTexCoordLocation == null) return;
		if (this._cubeNormalLocation == null) return;

		gl.useProgram(this._cubeProgram);
		// TODO: calculate matrices only when camera moves and cache them
		this.setUniforms(this._cubeProgram, {
			...this._cameraUniforms,
			...this._lightUniforms,
			uCameraPosition: [...this._cameraPosition]
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

		if (this._material?.isValid()) {

			const textureSlots: TextureSlot[] = [
				// "normal",
				"ao",
				// "roughness",
			];

			textureSlots.forEach((slot, index) => {
				const texture = this._material!.getTexture(slot);

				if (texture?.isValid()) {
					this.setUniforms(this._cubeProgram!, {
						[`u${slot.charAt(0).toUpperCase() + slot.slice(1)}Texture`]: index
					});
				} else {
					console.warn(`Texture slot '${slot}' is missing or invalid`);
				}
			});

			if (this._cubeMap && this._cubeMap.isValid()) {
				gl.activeTexture(gl.TEXTURE3);
				gl.bindTexture(gl.TEXTURE_CUBE_MAP, this._cubeMap.getId()!);
				if (this._environmentMapLoc !== null) {
					gl.uniform1i(this._environmentMapLoc, 3);
				}
			}
		}

		const totalCubes = this._objects.length;
		for (let i = 0; i < totalCubes; i++) {
			const drawable = this._objects[i];

			const colIndex = i % 10;
    		const rowIndex = Math.floor(i / 10);

			let uMetallic = 0.1 + (colIndex * 0.1);
			let uRoughness = 0.1 + (rowIndex * 0.1);
			if (uMetallic >= 1) uMetallic = 0.95;
			if (uRoughness >= 1) uRoughness = 0.95;
			if (i === 0) uMetallic = 0.01;
			if (i === 0) uRoughness = 0.01;

			this.setUniforms(this._cubeProgram, {
				uModelPosition: drawable.model.position,
				uBaseColor: [ 0.8, 0.8, 0.9 ],
				uMetallic: uMetallic,
				uRoughness: uRoughness,
			});
			gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);
		}
	}

}

export default CubeRenderer;