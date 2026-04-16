export interface ResourceOptions {
	glContext: WebGLRenderingContext;
}

class Resource {

	protected _glContext: WebGLRenderingContext;

	constructor(options: ResourceOptions) {
		if (!options.glContext)
			throw new Error("Resource::constructor()\n\WebGLRenderingContext is required to create program");

		this._glContext = options.glContext;
	}

	get glContext(): WebGLRenderingContext {
		return this._glContext;
	}

	async fetchFromUrl(url: string): Promise<string | null> {
		if (!url) {
			console.error("Resource::fetchFromUrl()\n\tURL is required to fetch resource");
			return null;
		}

		try {
			const response = await fetch(url);
			if (response.ok) return await response.text();

			throw new Error(`Status: ${response.status}, ${response.statusText}`);
		} catch (error: unknown) {
			console.error(`Resource::fetchFromUrl()\n\tError fetching resource from URL: ${url}\n\t${error instanceof Error ? error.message : String(error)}`);
		}
		return null;
	}
}

export default Resource;