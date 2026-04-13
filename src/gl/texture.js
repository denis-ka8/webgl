import GLResource from "./resource";

class GLTexture extends GLResource {

	_glContext = null;

	constructor(options = {}) {
		super(options);

		this._glContext = options.glContext || this._glContext;
	}

	create() {
		const gl = this._glContext;
		const texture = gl.createTexture();
		return texture;
	}
}

export default GLTexture;