import Renderer from "./glRenderer";
import Shader from "../gl/shader";
import Program from "../gl/program";
import GLBuffer from "../gl/buffer";
import { Vec3 } from "../math/vec3";

class PointRenderer extends Renderer {

	private _program: WebGLProgram | null = null;
	private _pointPositionLoc: number | null = null;
    private _pointBuffer: WebGLBuffer | null = null;

    private _points: Vec3[] = [];
    private _isBufferDirty: boolean = true;

	async _initResources(): Promise<void> {
		const gl = this._glContext;

		// Create shaders
		const vsShaderObj = new Shader({ glContext: gl, shaderType: gl.VERTEX_SHADER });
		await vsShaderObj.fetchFromUrl('./assets/shaders/unlit.vs');
		const vertexShader = vsShaderObj.create();
		if (!vertexShader) return;

		const fsShaderObj = new Shader({ glContext: gl, shaderType: gl.FRAGMENT_SHADER });
		await fsShaderObj.fetchFromUrl('./assets/shaders/unlit.fs');
		const fragmentShader = fsShaderObj.create();
		if (!fragmentShader) return;

		// Create program
		const cubeProgramObj = new Program({ glContext: gl, vertexShader, fragmentShader });
		this._program = cubeProgramObj.create();
		if (!this._program) return;

		this._pointPositionLoc = gl.getAttribLocation(this._program, "aPosition");
        if (this._pointPositionLoc === -1) return;

        // Create buffer
        const buffer = new GLBuffer({ glContext: gl });
        buffer.setData(new Float32Array([]));
        this._pointBuffer = buffer.create();
        if (!this._pointBuffer) return;

		this.setInitialized(true);
    }

    addPoint(position: Vec3): void {
        this._points.push(position);
        this._isBufferDirty = true;
    }

    clearPoints(): void {
        this._points = [];
        this._isBufferDirty = true;
    }

    private _updateBuffer(): void {
        if (!this._isBufferDirty) return;

        const gl = this._glContext;
        const positionsArray = new Float32Array(this._points.flatMap((p: Vec3) => p.toArray()));

        const buffer = new GLBuffer({ glContext: gl });
        buffer.setData(positionsArray);

        this._pointBuffer = buffer.create();
        this._isBufferDirty = false;
    }

    render(): void {
		if (!this.isInitialized) return;

		const gl = this._glContext;
        this._updateBuffer();

        gl.useProgram(this._program);

		this.setUniforms(this._program!, {
			...this._cameraUniforms,
			...this._lightUniforms,
            uPointColor: [ 1.0, 1.0, 1.0, 1.0 ],
		});
        gl.bindBuffer(gl.ARRAY_BUFFER, this._pointBuffer);
        gl.enableVertexAttribArray(this._pointPositionLoc!);
        gl.vertexAttribPointer(this._pointPositionLoc!, 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.POINTS, 0, this._points.length);
        gl.disableVertexAttribArray(this._pointPositionLoc!);
    }
}

export default PointRenderer;