import GLResource from "./resource";

class GLGeometry extends GLResource {

	constructor(options = {}) {
		super(options);

		this._vertexCount = 0;
		this._indices = [];
		this._indicesCount = 0;
	}

	get vertexCount() {
		return this._vertexCount;
	}

	get indices() {
		return this._indices;
	}

	get indicesCount() {
		return this._indicesCount;
	}

	create(source) {
		if (!source) {
			console.error("GLGeometry::create()\n\tGeometry source is required to create geometry");
			return null;
		}

		const arrayBuffer = this._parseSource(source);
		if (!arrayBuffer) {
			console.error("GLGeometry::create()\n\tFailed to parse geometry source");
			return null;
		}
		return arrayBuffer;

		// this._saveBinFile("geometry.bin", arrayBuffer);

		//

		// const gl = this._glContext;

		// const buffer = gl.createBuffer();
		// gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrayBuffer), gl.STATIC_DRAW);

		// return buffer;
	}

	_parseSource(source) {
		if (!source) {
			console.error("GLGeometry::_parseSource()\n\tGeometry source is required to parse geometry");
			return null;
		}

		const lines = source.split("\n");

		const vertices = [];
		const normals = [];
		const texCoords = [];
		const vertexMap = new Map();
		const finalVertices = [];
		const indices = [];
		let nextIndex = 0;

		for (const line of lines) {
			const [command, ...values] = line.trim().split(/\s+/, 4);
			if (command === "v") {
				const x = parseFloat(values[0]);
				const y = parseFloat(values[1]);
				const z = parseFloat(values[2]);
				vertices.push(x, y, z);
			} else if (command === "vn") {
				const x = parseFloat(values[0]);
				const y = parseFloat(values[1]);
				const z = parseFloat(values[2]);
				normals.push(x, y, z);
			} else if (command === "vt") {
				const u = parseFloat(values[0]);
				const v = parseFloat(values[1]);
				texCoords.push(u, v);
			} else if (command === "f") {
				for (const group of values) {
					const [vertexIndex, texCoordIndex, normalIndex] = group.split("/").map(Number);
					const key = `${vertexIndex}/${texCoordIndex}/${normalIndex}`;
					let index = vertexMap.get(key);
					if (index === undefined) {
						const vOffset = (vertexIndex - 1) * 3;
						const uvOffset = (texCoordIndex - 1) * 2;
						const nOffset = (normalIndex - 1) * 3;
						finalVertices.push(
							vertices[vOffset], vertices[vOffset + 1], vertices[vOffset + 2],
							texCoords[uvOffset], texCoords[uvOffset + 1],
							normals[nOffset], normals[nOffset + 1], normals[nOffset + 2]
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

		return new Float32Array(finalVertices).buffer;
	}

	_saveBinFile(filename, arrayBuffer) {
		const blob = new Blob([arrayBuffer], { type: "application/octet-stream" });
		const url = URL.createObjectURL(blob);

		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		a.click();

		URL.revokeObjectURL(url);
	}

	async fromFile() {
		const file = await fetch("./assets/geometry.bin");
		const arrayBuffer = await file.arrayBuffer();
		return arrayBuffer;
	}
}

export default GLGeometry;