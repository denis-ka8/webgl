import Resource, { ResourceOptions, WebGLResourceId } from "./resource";

interface BufferOptions extends ResourceOptions {
	type?: number;
	usage?: number;
}

class GLBuffer extends Resource {

	private _buffer: WebGLBuffer | null = null;
	private readonly _type: number;
	private readonly _usage: number;

	constructor(options: BufferOptions) {
		super(options);
		this._type = options.type ?? this._glContext.ARRAY_BUFFER;
		this._usage = options.usage ?? this._glContext.STATIC_DRAW;
	}

	create(): WebGLBuffer | null {
		if (this._buffer) {
			console.warn("Buffer::create()\n\tBuffer already created");
			return this._buffer;
		}

		const gl = this._glContext;
		this._buffer = gl.createBuffer();
		if (!this._buffer) {
			console.error("Buffer::create()\n\tFailed to create buffer object");
			return null;
		}

		this.setId(this._buffer);
		return this._buffer;
	}

	setData(data: ArrayBuffer | ArrayBufferView | ArrayBufferLike): void {
		if (!this.isValid()) {
			console.error("Buffer::setData()\n\tCannot set data: buffer is not valid");
			return;
		}

		const gl = this._glContext;
		gl.bindBuffer(this._type, this._buffer);
		gl.bufferData(this._type, data, this._usage);
	}

	updateData(data: ArrayBuffer | ArrayBufferView | ArrayBufferLike): void {
		this.setData(data);
	}

	bind(type: number = this._type): void {
		if (!this.isValid()) {
			console.error("Buffer::bind()\n\tCannot bind buffer: resource is not valid");
			return;
		}

		const gl = this._glContext;
		gl.bindBuffer(type, this._buffer);
	}

	unbind(type: number = this._type): void {
		const gl = this._glContext;
		gl.bindBuffer(type, null);
	}

	protected _destroyGLResource(resource: WebGLResourceId): void {
		const gl = this._glContext;
		if (resource instanceof WebGLBuffer) {
			gl.deleteBuffer(resource);
			return;
		}

		console.warn("Buffer::_destroyGLResource()\n\tInvalid resource type");
	}
}

export default GLBuffer;