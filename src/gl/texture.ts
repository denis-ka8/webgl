import Resource, { ResourceOptions } from "./resource";

interface TextureOptions extends ResourceOptions {
}

class Texture extends Resource {

	private _texture: WebGLTexture | null = null;

	constructor(options: TextureOptions) {
		super(options);
	}

	create(): WebGLTexture | null {
    	const gl = this._glContext;
		this._texture = gl.createTexture();
		if (!this._texture) {
			console.error("Texture::create()\n\tFailed to create texture object");
			return null;
		}

		return this._texture;
	}

	bind(texture: WebGLTexture): this {
		if (!texture) {
			console.error("Texture::bind()\n\tCannot bind texture: context or texture is unavailable");
			return this;
		}

		const gl = this._glContext;
		gl.bindTexture(gl.TEXTURE_2D, texture);
		return this;
	}

	setFlipY(enabled: boolean): this {
		const gl = this._glContext;
    	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, enabled ? 1 : 0);
		return this;
	}

	uploadImage(texture: WebGLTexture, image: HTMLImageElement, flipY: boolean): this {
		if (!image) {
			console.error("Texture::uploadImage()\n\tImage is required to upload to texture");
			return this;
		}

		this.bind(texture);
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

	generateMipmap(texture: WebGLTexture): this {
		this.bind(texture);
		const gl = this._glContext;
		gl.generateMipmap(gl.TEXTURE_2D);
		return this;
	}

	setWrapMode(texture: WebGLTexture, wrapS: number, wrapT: number): this {
		const gl = this._glContext;
		this.bind(texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
		return this;
	}

	setFilter(texture: WebGLTexture, minFilter: number, magFilter: number): this {
		const gl = this._glContext;
		this.bind(texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
		return this;
	}

	configureTexture(texture: WebGLTexture, image: HTMLImageElement): this {
		const gl = this._glContext;
		const isPOT = this._isPowerOfTwo(image.width) && this._isPowerOfTwo(image.height);

		if (isPOT) {
			this.generateMipmap(texture);
			this.setWrapMode(texture, gl.REPEAT, gl.REPEAT);
			this.setFilter(texture, gl.LINEAR_MIPMAP_LINEAR, gl.LINEAR);
		} else {
			this.setWrapMode(texture, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);
			this.setFilter(texture, gl.LINEAR, gl.LINEAR);
		}
		return this;
	}

	destroy(): void {
		const gl = this._glContext;
		if (this._texture) {
			gl.deleteTexture(this._texture);
			this._texture = null;
		}
	}


	async loadFromUrl(url: string, texture: WebGLTexture): Promise<this> {
		try {
			const image = await this._loadImage(url);
			this.uploadImage(texture, image, true);
			this.configureTexture(texture, image);
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