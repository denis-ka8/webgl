import GLResource from "./resource";

class GLTexture extends GLResource {

	_glContext = null;

	constructor(options = {}) {
		super(options);

		this._glContext = options.glContext || this._glContext;
	}

	create() {
		return this._glContext.createTexture();
	}

	bind(texture) {
		this._glContext.bindTexture(this._glContext.TEXTURE_2D, texture);
		return this;
	}

	setFlipY(enabled) {
		this._glContext.pixelStorei(this._glContext.UNPACK_FLIP_Y_WEBGL, enabled);
		return this;
	}

	uploadImage(texture, image, flipY) {
		this.bind(texture);
		this.setFlipY(flipY);
		this._glContext.texImage2D(
			this._glContext.TEXTURE_2D,
			0,
			this._glContext.RGBA,
			this._glContext.RGBA,
			this._glContext.UNSIGNED_BYTE,
			image
		);
		return this;
	}

	generateMipmap(texture) {
		this.bind(texture);
		this._glContext.generateMipmap(this._glContext.TEXTURE_2D);
		return this;
	}

	setWrapMode(texture, wrapS, wrapT) {
		this.bind(texture);
		this._glContext.texParameteri(this._glContext.TEXTURE_2D, this._glContext.TEXTURE_WRAP_S, wrapS);
		this._glContext.texParameteri(this._glContext.TEXTURE_2D, this._glContext.TEXTURE_WRAP_T, wrapT);
		return this;
	}

	setFilter(texture, minFilter, magFilter) {
		this.bind(texture);
		this._glContext.texParameteri(this._glContext.TEXTURE_2D, this._glContext.TEXTURE_MIN_FILTER, minFilter);
		this._glContext.texParameteri(this._glContext.TEXTURE_2D, this._glContext.TEXTURE_MAG_FILTER, magFilter);
		return this;
	}

	configureTexture(texture, image) {
		const isPOT = this._isPowerOfTwo(image.width) && this._isPowerOfTwo(image.height);

		if (isPOT) {
			this.generateMipmap(texture);
			this.setWrapMode(texture, this._glContext.REPEAT, this._glContext.REPEAT);
			this.setFilter(texture, this._glContext.LINEAR_MIPMAP_LINEAR, this._glContext.LINEAR);
		} else {
			this.setWrapMode(texture, this._glContext.CLAMP_TO_EDGE, this._glContext.CLAMP_TO_EDGE);
			this.setFilter(texture, this._glContext.LINEAR, this._glContext.LINEAR);
		}
		return this;
	}

	async loadFromUrl(url, texture) {
		const image = await this._loadImage(url);
		this.uploadImage(texture, image, true);
		this.configureTexture(texture, image);
	}

	_loadImage(url) {
		return new Promise((resolve, reject) => {
			const image = new Image();
			image.crossOrigin = 'anonymous';
			image.onload = () => resolve(image);
			image.onerror = () => reject(new Error(`Failed to load image: ${url}`));
			image.src = url;
		});
	}

	_isPowerOfTwo(value) {
		return (value & (value - 1)) === 0;
	}
}

export default GLTexture;