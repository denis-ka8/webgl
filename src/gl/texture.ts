import Resource, { ResourceOptions, WebGLResourceId } from "./resource";

interface TextureOptions extends ResourceOptions {
}

class Texture extends Resource {

	private _texture: WebGLTexture | null = null;

	constructor(options: TextureOptions) {
		super(options);
	}

	getTexture(): WebGLTexture | null {
		return this._texture;
	}

	create(): WebGLTexture | null {
    	const gl = this._glContext;
		this._texture = gl.createTexture();
		if (!this._texture) {
			console.error("Texture::create()\n\tFailed to create texture object");
			return null;
		}

		this.setId(this._texture);
		return this._texture;
	}

	protected _destroyGLResource(resource: WebGLResourceId): void {
		const gl = this._glContext;
		if (resource instanceof WebGLTexture) {
			gl.deleteTexture(resource);
		} else {
			console.warn("Texture::_destroyGLResource()\n\tInvalid resource type");
		}
	}

	isValid(): boolean {
		return super.isValid() && this._texture !== null;
	}

	bind(unit: number = 0): this {
		if (!this.isValid()) {
			console.error("Texture::bind()\n\tCannot bind texture: context or texture is unavailable");
			return this;
		}

		const gl = this._glContext;
		gl.activeTexture(gl.TEXTURE0 + unit);
		gl.bindTexture(gl.TEXTURE_2D, this._texture!);
		return this;
	}

	setFlipY(enabled: boolean): this {
		if (!this.isValid()) return this;

		const gl = this._glContext;
    	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, enabled ? 1 : 0);
		return this;
	}

	uploadImage(image: HTMLImageElement, flipY: boolean): this {
		if (!image) {
			console.error("Texture::uploadImage()\n\tImage is required to upload to texture");
			return this;
		}

		if (!this.isValid()) return this;

		this.bind();
		this.setFlipY(flipY);

		const gl = this._glContext;
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			image
		);
		return this;
	}

	generateMipmap(): this {
	    if (!this.isValid()) return this;

		const gl = this._glContext;
		gl.generateMipmap(gl.TEXTURE_2D);
		return this;
	}

	setWrapMode(wrapS: number, wrapT: number): this {
    	if (!this.isValid()) return this;

		const gl = this._glContext;
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
		return this;
	}

	setFilter(minFilter: number, magFilter: number): this {
	    if (!this.isValid()) return this;

		const gl = this._glContext;
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
		return this;
	}

	configureTexture(image: HTMLImageElement): this {
		if (!this.isValid()) return this;

		const gl = this._glContext;
		const isPOT = this._isPowerOfTwo(image.width) && this._isPowerOfTwo(image.height);

		if (isPOT) {
			this.generateMipmap();
			this.setWrapMode(gl.REPEAT, gl.REPEAT);
			this.setFilter(gl.LINEAR_MIPMAP_LINEAR, gl.LINEAR);
		} else {
			this.setWrapMode(gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);
			this.setFilter(gl.LINEAR, gl.LINEAR);
		}
		return this;
	}

	async loadFromUrl(url: string): Promise<this> {
		try {
			const image = await this._loadImage(url);
			this.uploadImage(image, true);
			this.configureTexture(image);
		} catch (error) {
			console.error(`GLTexture::loadFromUrl()\n\tFailed to load image from ${url}:`, error);
		}
		return this;
	}

	private async _loadImage(url: string): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const image = new Image();
			image.crossOrigin = "anonymous";
			image.onload = () => resolve(image);
			image.onerror = () => reject(new Error(`Failed to load image: ${url}`));
			image.src = url;
		});
	}

	private _isPowerOfTwo(value: number): boolean {
		return (value & (value - 1)) === 0;
	}
}

export default Texture;