export type WebGLResourceId = WebGLTexture | WebGLShader | WebGLProgram | WebGLBuffer;

export interface IResource {
	create(): WebGLResourceId | null;
	dispose(): void;
	isValid(): boolean;
	getId(): WebGLResourceId | null;
	setId(id: WebGLResourceId | null): void;
	getGLContext(): WebGLRenderingContext;
}

export interface ResourceOptions {
	glContext: WebGLRenderingContext;
}

abstract class Resource implements IResource {

	protected _glContext: WebGLRenderingContext;
	protected _id: WebGLResourceId | null = null;
	protected _isCreated: boolean = false;
	protected _isDisposed: boolean = false;

	constructor(options: ResourceOptions) {
		if (!options.glContext)
			throw new Error("Resource::constructor()\n\WebGLRenderingContext is required to create program");

		this._glContext = options.glContext;
	}

	abstract create(): WebGLResourceId | null;

	dispose(): void {
		if (this._isDisposed) return;

		if (this._id) {
			this._destroyGLResource(this._id);
			this._id = null;
		}

		this._isCreated = false;
		this._isDisposed = true;
	}

	isValid(): boolean {
		return this._isCreated && !this._isDisposed && this._id !== null;
	}

	getId(): WebGLResourceId {
		if (!this.isValid())
			throw new Error(`Resource is not valid (created: ${this._isCreated}, disposed: ${this._isDisposed})`);

		return this._id!;
	}

	setId(id: WebGLResourceId | null): void {
		this._id = id;
		this._isCreated = id !== null;
		this._isDisposed = false;
	}

	getGLContext(): WebGLRenderingContext {
		return this._glContext;
	}

	// Abstract method for destroy specific resource
	protected abstract _destroyGLResource(resource: WebGLResourceId): void;
}

export default Resource;