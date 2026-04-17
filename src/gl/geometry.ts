import Resource, { ResourceOptions, WebGLResourceId } from "./resource";

interface GeometryOptions extends ResourceOptions {
}

interface ParsedGeometry {
	vertices: Float32Array;
	normals: Float32Array;
	texCoords: Float32Array;
	indices: Uint16Array;
	vertexCount: number;
	indicesCount: number;
}

const EMPTY_FLOAT_32_ARRAY = new Float32Array(0);
const EMPTY_UINT_16_ARRAY = new Uint16Array(0);

class Geometry extends Resource {

	private _parsedData: ParsedGeometry | null = null;
	private _vertexBuffer: WebGLBuffer | null = null;
	private _indexBuffer: WebGLBuffer | null = null;

	constructor(options: GeometryOptions) {
		super(options);
	}

	getVertices(): Float32Array {
		return this._parsedData?.vertices ?? EMPTY_FLOAT_32_ARRAY;
	}

	getVertexCount(): number {
		return this._parsedData?.vertexCount ?? 0;
	}

	getIndices(): Uint16Array {
		return this._parsedData?.indices ?? EMPTY_UINT_16_ARRAY;
	}

	getIndicesCount(): number {
		return this._parsedData?.indicesCount ?? 0;
	}

	create(): WebGLBuffer | null {
		if (!this._parsedData) {
			console.error("Geometry::create()\n\tNo parsed geometry data to create buffers");
			return null;
		}

		const gl = this._glContext;

		this._vertexBuffer = gl.createBuffer();
		if (!this._vertexBuffer) {
			console.error("Geometry::create()\n\tFailed to create vertex buffer");
			return null;
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this._parsedData.vertices, gl.STATIC_DRAW);

		this._indexBuffer = gl.createBuffer();
		if (!this._indexBuffer) {
			console.error("Geometry::create()\n\tFailed to create index buffer");
			gl.deleteBuffer(this._vertexBuffer);
			return null;
		}

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._parsedData.indices, gl.STATIC_DRAW);

		this.setId(this._vertexBuffer);

		return this._vertexBuffer;
	}

	protected _destroyGLResource(resource: WebGLResourceId): void {
		const gl = this._glContext;
		if (resource instanceof WebGLBuffer) {
			gl.deleteBuffer(resource);
			if (this._vertexBuffer && this._vertexBuffer !== resource) {
				gl.deleteBuffer(this._vertexBuffer);
			}
			if (this._indexBuffer && this._indexBuffer !== resource) {
				gl.deleteBuffer(this._indexBuffer);
			}
		} else {
			console.warn("Geometry::_destroyGLResource()\n\tInvalid resource type");
		}
	}

	parseSource(source: string): boolean {
		const parsed = this._parseSource(source);
		if (!parsed) {
			console.error("Geometry::parseSource()\n\tFailed to parse geometry source");
			return false;
		}
		this._parsedData = parsed;
		return true;
	}

	private _parseSource(source: string): ParsedGeometry | null {
		if (!source) {
			console.error("Geometry::_parseSource()\n\tGeometry source is required to parse geometry");
			return null;
		}

		const lines = source.split("\n");

		const vertices: number[] = [];
		const normals: number[] = [];
		const texCoords: number[] = [];
		const vertexMap = new Map<string, number>();
		const finalVertices: number[] = [];
		const indices: number[] = [];
		let nextIndex = 0;

		for (const line of lines) {
			const [command, ...values] = line.trim().split(/\s+/, 4);
			if (command === "v") {
				const x = parseFloat(values[0] ?? "0");
				const y = parseFloat(values[1] ?? "0");
				const z = parseFloat(values[2] ?? "0");
				vertices.push(x, y, z);
			} else if (command === "vn") {
				const x = parseFloat(values[0] ?? "0");
				const y = parseFloat(values[1] ?? "0");
				const z = parseFloat(values[2] ?? "0");
				normals.push(x, y, z);
			} else if (command === "vt") {
				const u = parseFloat(values[0] ?? "0");
				const v = parseFloat(values[1] ?? "0");
				texCoords.push(u, v);
			} else if (command === "f") {
				for (const group of values) {
					const splitParts = group.split("/");
					const vertexIndex = Number(splitParts[0]) || 0;
					const texCoordIndex = Number(splitParts[1]) || 0;
					const normalIndex = Number(splitParts[2]) || 0;

					const key = `${vertexIndex}/${texCoordIndex}/${normalIndex}`;
					let index = vertexMap.get(key);
					if (index === undefined) {
						const vOffset = (vertexIndex - 1) * 3;
						const uvOffset = (texCoordIndex - 1) * 2;
						const nOffset = (normalIndex - 1) * 3;
						finalVertices.push(
							this._safeGet(vertices, vOffset, 0),
							this._safeGet(vertices, vOffset + 1, 0),
							this._safeGet(vertices, vOffset + 2, 0),
							this._safeGet(texCoords, uvOffset, 0),
							this._safeGet(texCoords, uvOffset + 1, 0),
							this._safeGet(normals, nOffset, 0),
							this._safeGet(normals, nOffset + 1, 0),
							this._safeGet(normals, nOffset + 2, 0)
						);
						index = nextIndex++;
						vertexMap.set(key, index);
					}
					indices.push(index);
				}
			}
		}

		return {
			vertices: new Float32Array(finalVertices),
			normals: new Float32Array(normals),
			texCoords: new Float32Array(texCoords),
			indices: new Uint16Array(indices),
			vertexCount: nextIndex,
			indicesCount: indices.length
		}
		// return new Float32Array(finalVertices).buffer;
	}

	private _safeGet<T>(array: T[], index: number, defaultValue: T): T {
		return array[index] !== undefined ? array[index] : defaultValue;
	}

	// TODO: for tests
	private _saveBinFile(filename: string, arrayBuffer: ArrayBuffer): void {
		const blob = new Blob([arrayBuffer], { type: "application/octet-stream" });
		const url = URL.createObjectURL(blob);

		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		a.click();

		URL.revokeObjectURL(url);
	}

	// TODO: for tests
	async fromFile(filePath: string): Promise<ArrayBuffer | null> {
		try {
			const response = await fetch("./assets/geometry.bin");
			if (!response.ok) {
				throw new Error(`Failed to fetch geometry file: ${response.statusText}`);
			}
			const arrayBuffer = await response.arrayBuffer();
			return arrayBuffer;
		} catch (error) {
			console.error(`Geometry::fromFile()\n\tFailed to load geometry from ${filePath}:`, error);
			return null;
		}
	}

	// TMP here
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

export default Geometry;