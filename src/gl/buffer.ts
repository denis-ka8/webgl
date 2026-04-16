import Resource, { ResourceOptions } from "./resource";

interface BufferOptions extends ResourceOptions {
}

class Buffer extends Resource {

	private _buffer: WebGLBuffer | null = null;

	constructor(options: BufferOptions) {
		super(options);
	}

	create(
		data: ArrayBuffer | ArrayBufferView,
		type: number = this._glContext.ARRAY_BUFFER,
		usage: number = this._glContext.STATIC_DRAW
	): WebGLBuffer | null {
		if (!data) {
			console.error("Buffer::create()\n\tData is required to create buffer");
			return null;
		}

		const gl = this._glContext;
		this._buffer = gl.createBuffer();
		if (!this._buffer) {
			console.error("Buffer::create()\n\tFailed to create buffer object");
			return null;
		}

		gl.bindBuffer(type, this._buffer);
		gl.bufferData(type, data, usage);
		return this._buffer;
	}

	destroy(): void {
		const gl = this._glContext;
		if (this._buffer) {
			gl.deleteBuffer(this._buffer);
			this._buffer = null;
		}
	}

	bind(type: number = this._glContext.ARRAY_BUFFER): void {
		if (!this._buffer) {
			console.error("Buffer::bind()\n\tCannot bind buffer: context or buffer is unavailable");
			return;
		}
		const gl = this._glContext;
		gl.bindBuffer(type, this._buffer);
	}

	unbind(type: number = this._glContext.ARRAY_BUFFER): void {
		const gl = this._glContext;
		gl.bindBuffer(type, null);
	}
}

export default Buffer;