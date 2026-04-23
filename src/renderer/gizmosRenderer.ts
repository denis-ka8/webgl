import Renderer from "./glRenderer";
import Shader from "../gl/shader";
import Program from "../gl/program";
import GLBuffer from "../gl/buffer";
import { Vec3 } from "../math/vec3";
import { Ray } from "../math/ray";
import GizmosDrawable from "../drawables/gizmosDrawable";
import GizmosModel from "../models/gizmosModel";

class GizmosRenderer extends Renderer {

	private _program: WebGLProgram | null = null;
	private _pointPositionLoc: number | null = null;
    private _pointBufferObj: GLBuffer | null = null;
    private _pointBuffer: WebGLBuffer | null = null;
    private _lineBufferObj: GLBuffer | null = null;
    private _lineBuffer: WebGLBuffer | null = null;

    private _gizmos: GizmosDrawable | null = null;

    private _points: Vec3[] = [];
    private _lines: Ray[] = [];
    private _isBufferDirty: boolean = true;
    private _isLineBufferDirty: boolean = true;

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
        this._pointBufferObj = new GLBuffer({ glContext: gl });
        this._pointBuffer = this._pointBufferObj.create();
        this._pointBufferObj.setData(new Float32Array([]));
        if (!this._pointBuffer) return;

        this._lineBufferObj = new GLBuffer({ glContext: gl });
        this._lineBuffer = this._lineBufferObj.create();
        this._lineBufferObj.setData(new Float32Array([]));
        if (!this._lineBuffer) return;

		this.setInitialized(true);
    }

    addGizmos(gizmosDrawable: GizmosDrawable) {
        this._gizmos = gizmosDrawable;
        const model = this._gizmos.model as GizmosModel;
        if (!model) return;

        this._points = model.points;
        this._isBufferDirty = true;

        this._lines = model.lines;
        this._isLineBufferDirty = true;
    }

    private _updateBuffer(): void {
        if (!this._isBufferDirty || !this.isInitialized) return;

        const positionsArray = new Float32Array(this._points.flatMap((p: Vec3) => p.toArray()));
        this._pointBufferObj!.updateData(positionsArray);
        this._isBufferDirty = false;
    }

    private _updateLinesBuffer(): void {
        if (!this._isLineBufferDirty || !this.isInitialized) return;

        const positionsArray = new Float32Array(this._lines.flatMap((line: Ray) => {
            const { origin, direction } = line;
            const end = origin.add(direction.scale(3));
            return [ origin.x, origin.y, origin.z, end.x, end.y, end.z ]
        }));
        this._lineBufferObj!.updateData(positionsArray);
        this._isLineBufferDirty = false;
    }

    render(): void {
		if (!this.isInitialized) return;
        if (!this._gizmos?.visible) return;

		const gl = this._glContext;
        this._updateBuffer();
        this._updateLinesBuffer();

        // Render points
        gl.useProgram(this._program);

		this.setUniforms(this._program!, {
			...this._cameraUniforms,
			...this._lightUniforms,
            uColor: [ 1.0, 1.0, 1.0, 1.0 ],
		});

        gl.bindBuffer(gl.ARRAY_BUFFER, this._pointBuffer);
        gl.enableVertexAttribArray(this._pointPositionLoc!);
        gl.vertexAttribPointer(this._pointPositionLoc!, 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.POINTS, 0, this._points.length);
        gl.disableVertexAttribArray(this._pointPositionLoc!);

        // Render lines
        this.setUniforms(this._program!, {
            uColor: [ 0.0, 1.0, 0.0, 1.0 ],
		});

        gl.bindBuffer(gl.ARRAY_BUFFER, this._lineBuffer);
        gl.enableVertexAttribArray(this._pointPositionLoc!);
        gl.vertexAttribPointer(this._pointPositionLoc!, 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.LINES, 0, this._lines.length * 2);
        gl.disableVertexAttribArray(this._pointPositionLoc!);
    }
}

export default GizmosRenderer;