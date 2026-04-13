import GLRenderer from "./glRenderer"
import GLProgram from "../gl/program"
import GLShader from "../gl/shader";
import GLGeometry from "../gl/geometry";
import GLBuffer from "../gl/buffer";
import GLTexture from "../gl/texture";

import GLCamera from "../camera/camera";
import CameraController from "../camera/cameraController";
import { m4 } from "../math/m4";
import { vec3 } from "../math/vec3"

class CubeRenderer extends GLRenderer {

	constructor(canvas, options={}) {
		super(canvas, options);
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

		// Create camera and controller
		this._camera = new GLCamera({
			position: vec3(0, 0, 200),
			aspect: gl.canvas.clientWidth / gl.canvas.clientHeight,
		});
		const cameraController = new CameraController(this._camera, gl);
		cameraController.listen();

		this._positionLocation = gl.getAttribLocation(this._program, "a_position");
		this._colorLocation = gl.getAttribLocation(this._program, "a_color");
		this._matrixLocation = gl.getUniformLocation(this._program, "u_matrix");

		this._positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this._positionBuffer);
		this._setGeometry(gl);

		this._colorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this._colorBuffer);
		this._setColors(gl);

		// -------------------------------

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

		this._inited = true;
	}

	// TODO: load geometry data from external source
	_setGeometry(gl) {
		const positions = new Float32Array([
			// left column front
			0,   0,  0,
			0, 150,  0,
			30,   0,  0,
			0, 150,  0,
			30, 150,  0,
			30,   0,  0,

			// top rung front
			30,   0,  0,
			30,  30,  0,
			100,   0,  0,
			30,  30,  0,
			100,  30,  0,
			100,   0,  0,

			// middle rung front
			30,  60,  0,
			30,  90,  0,
			67,  60,  0,
			30,  90,  0,
			67,  90,  0,
			67,  60,  0,

			// left column back
			0,   0,  30,
			30,   0,  30,
			0, 150,  30,
			0, 150,  30,
			30,   0,  30,
			30, 150,  30,

			// top rung back
			30,   0,  30,
			100,   0,  30,
			30,  30,  30,
			30,  30,  30,
			100,   0,  30,
			100,  30,  30,

			// middle rung back
			30,  60,  30,
			67,  60,  30,
			30,  90,  30,
			30,  90,  30,
			67,  60,  30,
			67,  90,  30,

			// top
			0,   0,   0,
			100,   0,   0,
			100,   0,  30,
			0,   0,   0,
			100,   0,  30,
			0,   0,  30,

			// top rung right
			100,   0,   0,
			100,  30,   0,
			100,  30,  30,
			100,   0,   0,
			100,  30,  30,
			100,   0,  30,

			// under top rung
			30,   30,   0,
			30,   30,  30,
			100,  30,  30,
			30,   30,   0,
			100,  30,  30,
			100,  30,   0,

			// between top rung and middle
			30,   30,   0,
			30,   60,  30,
			30,   30,  30,
			30,   30,   0,
			30,   60,   0,
			30,   60,  30,

			// top of middle rung
			30,   60,   0,
			67,   60,  30,
			30,   60,  30,
			30,   60,   0,
			67,   60,   0,
			67,   60,  30,

			// right of middle rung
			67,   60,   0,
			67,   90,  30,
			67,   60,  30,
			67,   60,   0,
			67,   90,   0,
			67,   90,  30,

			// bottom of middle rung.
			30,   90,   0,
			30,   90,  30,
			67,   90,  30,
			30,   90,   0,
			67,   90,  30,
			67,   90,   0,

			// right of bottom
			30,   90,   0,
			30,  150,  30,
			30,   90,  30,
			30,   90,   0,
			30,  150,   0,
			30,  150,  30,

			// bottom
			0,   150,   0,
			0,   150,  30,
			30,  150,  30,
			0,   150,   0,
			30,  150,  30,
			30,  150,   0,

			// left side
			0,   0,   0,
			0,   0,  30,
			0, 150,  30,
			0,   0,   0,
			0, 150,  30,
			0, 150,   0
		]);

		let matrix = m4.xRotation(Math.PI);
		matrix = m4.translate(matrix, -50, -75, -15);

		for (let ii = 0; ii < positions.length; ii += 3) {
			const vector = m4.vectorMultiply([positions[ii + 0], positions[ii + 1], positions[ii + 2], 1], matrix);
			positions[ii + 0] = vector[0];
			positions[ii + 1] = vector[1];
			positions[ii + 2] = vector[2];
		}

		gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
	}

	// TODO: load color data from external source
	_setColors(gl) {
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Uint8Array([
				// left column front
				200,  70, 120,
				200,  70, 120,
				200,  70, 120,
				200,  70, 120,
				200,  70, 120,
				200,  70, 120,

				// top rung front
				200,  70, 120,
				200,  70, 120,
				200,  70, 120,
				200,  70, 120,
				200,  70, 120,
				200,  70, 120,

				// middle rung front
				200,  70, 120,
				200,  70, 120,
				200,  70, 120,
				200,  70, 120,
				200,  70, 120,
				200,  70, 120,

				// left column back
				80, 70, 200,
				80, 70, 200,
				80, 70, 200,
				80, 70, 200,
				80, 70, 200,
				80, 70, 200,

				// top rung back
				80, 70, 200,
				80, 70, 200,
				80, 70, 200,
				80, 70, 200,
				80, 70, 200,
				80, 70, 200,

				// middle rung back
				80, 70, 200,
				80, 70, 200,
				80, 70, 200,
				80, 70, 200,
				80, 70, 200,
				80, 70, 200,

				// top
				70, 200, 210,
				70, 200, 210,
				70, 200, 210,
				70, 200, 210,
				70, 200, 210,
				70, 200, 210,

				// top rung right
				200, 200, 70,
				200, 200, 70,
				200, 200, 70,
				200, 200, 70,
				200, 200, 70,
				200, 200, 70,

				// under top rung
				210, 100, 70,
				210, 100, 70,
				210, 100, 70,
				210, 100, 70,
				210, 100, 70,
				210, 100, 70,

				// between top rung and middle
				210, 160, 70,
				210, 160, 70,
				210, 160, 70,
				210, 160, 70,
				210, 160, 70,
				210, 160, 70,

				// top of middle rung
				70, 180, 210,
				70, 180, 210,
				70, 180, 210,
				70, 180, 210,
				70, 180, 210,
				70, 180, 210,

				// right of middle rung
				100, 70, 210,
				100, 70, 210,
				100, 70, 210,
				100, 70, 210,
				100, 70, 210,
				100, 70, 210,

				// bottom of middle rung.
				76, 210, 100,
				76, 210, 100,
				76, 210, 100,
				76, 210, 100,
				76, 210, 100,
				76, 210, 100,

				// right of bottom
				140, 210, 80,
				140, 210, 80,
				140, 210, 80,
				140, 210, 80,
				140, 210, 80,
				140, 210, 80,

				// bottom
				90, 130, 110,
				90, 130, 110,
				90, 130, 110,
				90, 130, 110,
				90, 130, 110,
				90, 130, 110,

				// left side
				160, 160, 220,
				160, 160, 220,
				160, 160, 220,
				160, 160, 220,
				160, 160, 220,
				160, 160, 220
			]),
			gl.STATIC_DRAW
		);
	}

	_setupVertexAttributes(gl, program, vertexBuffer) {
	}

	render() {
		// TODO: realize resource ready state and render only when resources are loaded
		if (!this._camera) return; // Resources not initialized yet
		if (!this._inited) return; // Resources not initialized yet

		const gl = this._glContext;

		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		super.render();
		gl.enable(gl.CULL_FACE);
		gl.enable(gl.DEPTH_TEST);

		/*
		gl.useProgram(this._program);

		gl.enableVertexAttribArray(this._positionLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, this._positionBuffer);
		gl.vertexAttribPointer(this._positionLocation, 3, gl.FLOAT, false, 0, 0);

		gl.enableVertexAttribArray(this._colorLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, this._colorBuffer);
		gl.vertexAttribPointer(this._colorLocation, 3, gl.UNSIGNED_BYTE, true, 0, 0);

		gl.uniformMatrix4fv(this._matrixLocation, false, this._camera.getViewProjectionMatrix());

		gl.drawArrays(gl.TRIANGLES, 0, 16 * 6);
		*/

		// -------------------------------

		gl.useProgram(this._cubeProgram);
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
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this._cubeTexture);
		gl.uniform1i(gl.getUniformLocation(this._cubeProgram, "uTexture"), 0);

		const indexCount = this._indCount;
		gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);
	}

}

export default CubeRenderer;