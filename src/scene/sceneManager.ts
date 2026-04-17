import SceneModel from "./sceneModel";
import SceneView from "./sceneView";
import CubeRenderer from "../renderer/cubeRenderer";
import Camera from "../models/camera/camera";
import CubeModel from "../models/cubeModel";
import DirectionalLight from "../models/light/directionalLight";
import { vec3 } from "../math/vec3";

/**
 * SceneManager is responsible for managing the scene,
 * including the scene model, view, and renderer.
 * It provides methods to initialize the scene, start and stop
 * the rendering loop, and handle resizing of the canvas.
 */
class SceneManager {

	private _canvas: HTMLCanvasElement;
	private _glContext: WebGLRenderingContext;
	private _sceneModel: SceneModel;
	private _renderer: CubeRenderer;
	private _sceneView: SceneView;
	private _isRunning: boolean = false;

	constructor(canvas: HTMLCanvasElement) {
		this._canvas = canvas;
		this._glContext = canvas.getContext('webgl') as WebGLRenderingContext;

		if (!this._glContext) {
			throw new Error('WebGL not supported');
		}

		this._sceneModel = new SceneModel();
		this._renderer = new CubeRenderer({ glContext: this._glContext });
		this._sceneView = new SceneView(this._sceneModel, this._renderer, this._glContext);
	}
	
	initialize(): void {
		this._createCamera();
		this._createGlobalLight();
		this._createCubes();
	}

	start(): void {
		this._isRunning = true;
		this._renderLoop();
	}

	stop(): void {
		this._isRunning = false;
	}

	resize(width: number, height: number): void {
		this._canvas.width = width;
		this._canvas.height = height;
		this._sceneView.resize(width, height);
	}

	private _renderLoop(): void {
		if (!this._isRunning) return;

		this._sceneView.update();

		requestAnimationFrame(() => this._renderLoop());
	}

	private _createCamera(): void {
		const canvas = this._glContext.canvas;
		let aspectRatio: number;

		if (canvas instanceof HTMLCanvasElement) {
			aspectRatio = canvas.clientWidth / canvas.clientHeight;
		} else {
			aspectRatio = canvas.width / canvas.height;
		}
		const camera = new Camera({
			position: vec3(10, 10, 10),
			target: vec3(0, 0, 0),
			xAngle: 45,
			yAngle: -45,
			aspect: aspectRatio,
		});
		this._sceneModel.addCamera(camera);
	}

	private _createGlobalLight(): void {
		const globalLight = new DirectionalLight({
			intensity: 0.95,
			direction: vec3(-0.6, -1.0, -0.4),
		});
		this._sceneModel.addLight(globalLight);
	}

	private _createCubes(): void {
		const gridSpacing = 5;
		const gridOffset = gridSpacing;
		for (let row = 0; row < 10; row += 1) {
			for (let col = 0; col < 10; col += 1) {
				const x = col * gridSpacing - gridOffset;
				const z = row * gridSpacing - gridOffset;
				const cubeModel = new CubeModel({ position: vec3(x, 0, z) });
				this._sceneModel.addObject(cubeModel);
			}
		}
	}
}

export default SceneManager;