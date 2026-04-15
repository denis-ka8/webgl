class GLRenderer {
	constructor(glContext, options = {}) {
		// this._canvas = canvas;
		this._glContext = glContext;

		this._options = {
			clearColor: [0, 0, 0, 0],
			...options
		};

		this._camera = null;

		this._objects = [];

		this._initGL();
		this._initResources();
	}

	_initGL() {
		const gl = this._glContext;
		gl.clearColor(...this._options.clearColor);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);

		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		gl.disable(gl.CULL_FACE);
	}

	async _initResources() {
		// Override in subclass to initialize shaders, buffers, etc.
	}

	// TODO: wip
	updateScene(diffData) {
		if (diffData.additions.length)
			this._objects = diffData.additions;
	}

	setCamera(camera) {
		this._camera = camera;
	}

	setSize(width, height) {
		// TODO: here? or in SceneView?
		// this._canvas.width = width;
		// this._canvas.height = height;
		this._glContext.viewport(0, 0, width, height);
	}

	clear() {
		const gl = this._glContext;
		gl.clearColor(...this._options.clearColor);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}

	useProgram(program) {
		this._glContext.useProgram(program);
	}

	setUniforms(program, uniforms) {
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

	drawArrays(mode, first, count) {
		this._glContext.drawArrays(mode, first, count);
	}
	
	drawElements(mode, count, type, offset) {
		this._glContext.drawElements(mode, count, type, offset);
	}

	render() {
		this.clear();
	}
}

export default GLRenderer;