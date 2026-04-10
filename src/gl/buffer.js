import GLResource from "./resource"

class GLBuffer extends GLResource {

	_glContext = null;

	constructor(options={}) {
		super(options);
		this._glContext = options.glContext || this._glContext;
	}

	create(data, type = this._glContext.ARRAY_BUFFER, usage = this._glContext.STATIC_DRAW) {
		if (!data) {
			console.error("GLBuffer::create()\n\tData is required to create buffer");
			return null;
		}

		const gl = this._glContext;
		const buffer = gl.createBuffer();
		gl.bindBuffer(type, buffer);
		gl.bufferData(type, data, usage);
		return buffer;
	}
}

export default GLBuffer;