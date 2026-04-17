import Resource, { ResourceOptions, WebGLResourceId } from "./resource";

interface BufferOptions extends ResourceOptions {
	type?: number;
	usage?: number;
}

class GLBuffer extends Resource {

	private _buffer: WebGLBuffer | null = null;
	private _data: ArrayBuffer | ArrayBufferView | ArrayBufferLike | null = null;
	private readonly _type: number;
	private readonly _usage: number;

	constructor(options: BufferOptions) {
		super(options);
		this._type = options.type ?? this._glContext.ARRAY_BUFFER;
		this._usage = options.usage ?? this._glContext.STATIC_DRAW;
	}

	create(): WebGLBuffer | null {
		if (!this._data) {
			console.error("Buffer::create()\n\tData is required to create buffer");
			return null;
		}

		const gl = this._glContext;
		this._buffer = gl.createBuffer();
		if (!this._buffer) {
			console.error("Buffer::create()\n\tFailed to create buffer object");
			return null;
		}

		gl.bindBuffer(this._type, this._buffer);
		gl.bufferData(this._type, this._data, this._usage);

		this.setId(this._buffer);

		return this._buffer;
	}

	setData(data: ArrayBuffer | ArrayBufferView | ArrayBufferLike): void {
		this._data = data;
	}

	protected _destroyGLResource(resource: WebGLResourceId): void {
		const gl = this._glContext;
		if (resource instanceof WebGLBuffer) {
			gl.deleteBuffer(resource);
		} else {
			console.warn("Buffer::_destroyGLResource()\n\tInvalid resource type");
		}
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
}

export default GLBuffer;