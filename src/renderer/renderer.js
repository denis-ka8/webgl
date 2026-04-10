class Renderer {

	_glContext = null;

	constructor(glContext) {
		this._glContext = glContext;
	}

	_resizeCanvasToDisplaySize(canvas, multiplier) {
		multiplier = multiplier || 1;
		const width  = canvas.clientWidth  * multiplier | 0;
		const height = canvas.clientHeight * multiplier | 0;
		if (canvas.width !== width ||  canvas.height !== height) {
			canvas.width  = width;
			canvas.height = height;
			return true;
		}
		return false;
	}

	draw() {
		const gl = this._glContext;
		this._resizeCanvasToDisplaySize(gl.canvas);

		// Tell WebGL how to convert from clip space to pixels
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

		// Clear the canvas
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		// Tell it to use our program (pair of shaders)
		gl.useProgram(program);

		// Turn on the attribute
		gl.enableVertexAttribArray(positionAttributeLocation);

		// Bind the position buffer.
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

		// Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
		var size = 2;          // 2 components per iteration
		var type = gl.FLOAT;   // the data is 32bit floats
		var normalize = false; // don't normalize the data
		var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
		var offset = 0;        // start at the beginning of the buffer
		gl.vertexAttribPointer(
			positionAttributeLocation, size, type, normalize, stride, offset);

		// draw
		var primitiveType = gl.TRIANGLES;
		var offset = 0;
		var count = 3;
		gl.drawArrays(primitiveType, offset, count);
	}
}

export default Renderer;