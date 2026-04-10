class GLRenderer {
	constructor(canvas, options = {}) {
		this._canvas = canvas;
		this._glContext = canvas.getContext('webgl');

		if (!this._glContext) {
			throw new Error('WebGL not supported');
		}

		this._options = {
			clearColor: [0, 0, 0, 1],
			...options
		};

		this._initGL();
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

	setSize(width, height) {
		this._canvas.width = width;
		this._canvas.height = height;
		this._glContext.viewport(0, 0, width, height);
	}

	clear() {
		const gl = this._glContext;
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}

	render(scene, camera) {
		this.clear();
	}
}

export default GLRenderer;