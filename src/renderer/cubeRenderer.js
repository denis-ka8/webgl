import GLRenderer from "./glRenderer"
import GLProgram from "../gl/program"
import GLShader from "../gl/shader";
import GLGeometry from "../gl/geometry";
import GLBuffer from "../gl/buffer";
import GLTexture from "../gl/texture";

class CubeRenderer extends GLRenderer {

	constructor(glContext, options={}) {
		super(glContext, options);
	}

	async _initResources() {
		const gl = this._glContext;

		// Create shaders
		const vsResource = new GLShader({ glContext: gl, shaderType: gl.VERTEX_SHADER });
		const vsSource = await vsResource.fetchFromUrl('./assets/shaders/test.vs');
		const vertexShader = vsResource.create(vsSource);

		const fsResource = new GLShader({ glContext: gl, shaderType: gl.FRAGMENT_SHADER });
		const fsSource = await fsResource.fetchFromUrl('./assets/shaders/test.fs');
		const fragmentShader = fsResource.create(fsSource);

		// Create program
		const glProgram = new GLProgram({ glContext: gl, vertexShader, fragmentShader });
		this._program = glProgram.create();

		// Create shaders
		const vsCubeResource = new GLShader({ glContext: gl, shaderType: gl.VERTEX_SHADER });
		const vsCubeSource = await vsCubeResource.fetchFromUrl('./assets/shaders/cube.vs');
		const cubeVertexShader = vsCubeResource.create(vsCubeSource);

		const fsCubeResource = new GLShader({ glContext: gl, shaderType: gl.FRAGMENT_SHADER });
		const fsCubeSource = await fsCubeResource.fetchFromUrl('./assets/shaders/cube.fs');
		const cubeFragmentShader = fsCubeResource.create(fsCubeSource);

		// Create program
		const cubeProgramObj = new GLProgram({ glContext: gl, vertexShader: cubeVertexShader, fragmentShader: cubeFragmentShader });
		this._cubeProgram = cubeProgramObj.create();

		this._cubePositionLocation = gl.getAttribLocation(this._cubeProgram, "aPosition");
		this._cubeTexCoordLocation = gl.getAttribLocation(this._cubeProgram, "aTexCoord");
		this._cubeNormalLocation = gl.getAttribLocation(this._cubeProgram, "aNormal");

		const geometryObj = new GLGeometry({ glContext: gl });
		const geometrySource = await geometryObj.fetchFromUrl('./assets/geometry/cube.obj');
		const geometryBuffer = geometryObj.create(geometrySource);
		this._cubeVertexCount = geometryObj.vertexCount;

		const vertexBuffer = new GLBuffer({ glContext: gl });
		this._cubeVertexBuffer = vertexBuffer.create(geometryBuffer);

		const indicesBuffer = new GLBuffer({ glContext: gl });
		this._indicesBuffer = indicesBuffer.create(new Uint16Array(geometryObj.indices), gl.ELEMENT_ARRAY_BUFFER);
		this._indCount = geometryObj.indicesCount;

		const textureObj = new GLTexture({ glContext: gl });
		this._cubeTexture = textureObj.create();
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

	render() {
		// TODO: realize resource ready state and render only when resources are loaded
		if (!this._camera) return; // Resources not initialized yet
		if (!this._inited) return; // Resources not initialized yet

		const gl = this._glContext;

		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		super.render();
		// gl.enable(gl.CULL_FACE);
		gl.enable(gl.DEPTH_TEST);

		gl.useProgram(this._cubeProgram);
		// TODO: calculate matrices only when camera moves and cache them
		this.setUniforms(this._cubeProgram, {
			uProjectionMatrix: this._camera.getProjectionMatrix(),
			uViewMatrix: this._camera.getViewMatrix()
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