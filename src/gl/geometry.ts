import Resource, { ResourceOptions } from "./resource";

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

class Geometry extends Resource {

	private _vertexCount: number = 0;
	private _indices: Uint16Array = new Uint16Array(0);
	private _indicesCount: number = 0;
	private _parsedData: ParsedGeometry | null = null;

	constructor(options: GeometryOptions) {
		super(options);
	}

	get vertexCount(): number {
		return this._vertexCount;
	}

	get indices(): Uint16Array {
		return this._indices;
	}

	get indicesCount(): number {
		return this._indicesCount;
	}

	create(source: string): ArrayBuffer | null {
		const arrayBuffer = this._parseSource(source);
		if (!arrayBuffer) {
			console.error("Geometry::create()\n\tFailed to parse geometry source");
			return null;
		}
		return arrayBuffer;
	}

	private _parseSource(source: string): ArrayBuffer | null {
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

		this._vertexCount = nextIndex;
		this._indices = new Uint16Array(indices);
		this._indicesCount = indices.length;

		this._parsedData = {
			vertices: new Float32Array(finalVertices),
			normals: new Float32Array(normals),
			texCoords: new Float32Array(texCoords),
			indices: this._indices,
			vertexCount: this._vertexCount,
			indicesCount: this._indicesCount
		};

		return new Float32Array(finalVertices).buffer;
	}

	private _safeGet<T>(array: T[], index: number, defaultValue: T): T {
		return array[index] !== undefined ? array[index] : defaultValue;
	}

	private _saveBinFile(filename: string, arrayBuffer: ArrayBuffer): void {
		const blob = new Blob([arrayBuffer], { type: "application/octet-stream" });
		const url = URL.createObjectURL(blob);

		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		a.click();

		URL.revokeObjectURL(url);
	}

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
}

export default Geometry;