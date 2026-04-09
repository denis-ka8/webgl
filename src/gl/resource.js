class GLResource {

	_glContext = null;

	constructor(options = {}) {
		this._glContext = options.glContext || this._glContext;
	}

	get glContext() { return this._glContext; }

	async fetchFromUrl(url) {
		if (!url) {
			console.error("GLResource::fetchFromUrl()\n\tURL is required to fetch resource");
			return null;
		}

		const response = await fetch(url);
		if (!response.ok) {
			console.error(`GLResource::fetchFromUrl()\n\tFailed to fetch resource from URL: ${url}\n\tStatus: ${response.status} ${response.statusText}`);
			return null;
		}

		return await response.text();
	}
}

export default GLResource;