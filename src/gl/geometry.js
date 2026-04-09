import GLResource from "./resource";

class GLGeometry extends GLResource {

	constructor(options = {}) {
		super(options);
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
		// console.log(lines);

		const vertices = [];
		const normals = [];
		const texCoords = [];
		const faces = [];

		const arrayBuffer = [];
		
		for (const line of lines) {
			console.log(line);
			const [ command, ...values ] = line.split(" ", 4);
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
					const [ vertexIndex, texCoordIndex, normalIndex ] = group.split("/").map(str => parseFloat(str));
					faces.push(vertexIndex, texCoordIndex, normalIndex);

					arrayBuffer.push(vertices[vertexIndex - 1]);
					arrayBuffer.push(texCoords[texCoordIndex - 1]);
					arrayBuffer.push(normals[normalIndex - 1]);
				}
			}


				// const parts = line.split(" ");
				// const p1 = parts[1].split("/");
				// // console.log(parseFloat(p1[0]), parseFloat(p1[1]), parseFloat(p1[2]))
				// faces.push(parseFloat(p1[0]), parseFloat(p1[1]), parseFloat(p1[2]));
				// const p2 = parts[2].split("/");
				// // console.log(parseFloat(p2[0]), parseFloat(p2[1]), parseFloat(p2[2]))
				// faces.push(parseFloat(p2[0]), parseFloat(p2[1]), parseFloat(p2[2]));
				// const p3 = parts[3].split("/");
				// // console.log(parseFloat(p3[0]), parseFloat(p3[1]), parseFloat(p3[2]))
				// faces.push(parseFloat(p3[0]), parseFloat(p3[1]), parseFloat(p3[2]));
		}

		console.log(vertices);
		console.log(texCoords);
		console.log(normals);
		// console.log(faces);
		console.log(arrayBuffer);

		return new Float32Array(arrayBuffer).buffer;
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