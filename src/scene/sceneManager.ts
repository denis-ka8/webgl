import SceneModel from "./sceneModel";
import SceneView from "./sceneView";
import CubeRenderer from "../renderer/cubeRenderer";
import PointRenderer from "../renderer/pointRenderer";
import Camera from "../models/camera/camera";
import CubeModel from "../models/cubeModel";
import DirectionalLight from "../models/light/directionalLight";
import { vec3 } from "../math/vec3";
import MeshDrawable from "../drawables/meshDrawable";
import Drawable from "../drawables/drawable";
import MeshModel from "../models/meshModel";
import BaseModel from "../models/model";

/**
 * SceneManager is responsible for managing the scene,
 * including the scene model, view, and renderer.
 * It provides methods to initialize the scene, start and stop
 * the rendering loop, and handle resizing of the canvas.
 */
class SceneManager {

	private _canvas: HTMLCanvasElement;
	private _canvas2: HTMLCanvasElement | null;
	private _glContext: WebGLRenderingContext;
	private _sceneModel: SceneModel;
	private _renderer: CubeRenderer;
	private _pointRenderer: PointRenderer;
	private _sceneView: SceneView;
	private _camera: Camera;
	private _isRunning: boolean = false;

	constructor(canvas: HTMLCanvasElement) {
		this._canvas = canvas;
		this._canvas2 = document.querySelector("#canvas2") as HTMLCanvasElement | null;
		this._glContext = canvas.getContext('webgl') as WebGLRenderingContext;

		if (!this._glContext) {
			throw new Error('WebGL not supported');
		}

		this._canvas.addEventListener('click', this._handleClick.bind(this));

		this._sceneModel = new SceneModel();
		this._renderer = new CubeRenderer({ glContext: this._glContext });
		this._pointRenderer = new PointRenderer({ glContext: this._glContext });
		this._sceneView = new SceneView(this._sceneModel, this._renderer, this._pointRenderer, this._glContext);
	}
	
	initialize(): void {
		this._createCamera();
		this._createGlobalLight();
		this._createCubes();

		this._createAxesPoints();
	}

	start(): void {
		this._isRunning = true;
		this._renderLoop();
	}

	stop(): void {
		this._isRunning = false;
	}

	resize(width: number, height: number): void {
		const canvas = this._glContext.canvas;
		let aspectRatio: number = canvas instanceof HTMLCanvasElement ?
			(canvas.clientWidth / canvas.clientHeight) :
			(canvas.width / canvas.height);
		this._camera.aspect = aspectRatio;

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
		let aspectRatio: number = canvas instanceof HTMLCanvasElement ?
			(canvas.clientWidth / canvas.clientHeight) :
			(canvas.width / canvas.height);

		this._camera = new Camera({
			position: vec3(40, 20, 50),
			target: vec3(0, 0, 0),
			xAngle: 30,
			yAngle: -30,
			aspect: aspectRatio,
		});
		this._sceneModel.addCamera(this._camera);
	}

	private _createGlobalLight(): void {
		const globalLight = new DirectionalLight({
			intensity: 0.95,
			direction: vec3(0.6, -1.0, -0.4),
		});
		this._sceneModel.addLight(globalLight);
	}

	private _createCubes(): void {
		const gridSpacing = 5;
		for (let row = 0; row < 10; row += 1) {
			for (let col = 0; col < 10; col += 1) {
				const x = col * gridSpacing;
				const z = row * gridSpacing;
				const cubeModel = new CubeModel({ position: vec3(x, 0, z) });
				this._sceneModel.addObject(cubeModel);
			}
		}
	}

	private _createAxesPoints(): void {
		const testPoints = [ vec3() ];
		for (let i=1; i<10; i++) {
			testPoints.push(vec3(12*i, 0, 0), vec3(0, 12*i, 0), vec3(0, 0, 12*i))
		}
		for (const point of testPoints)
			this._pointRenderer.addPoint(point);
	}

	private _handleClick(event: MouseEvent): void {
        const rect = this._canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const pickedObject: MeshDrawable | null = this._sceneView.pickObject(x, y);
        if (pickedObject) {
			const model = pickedObject.model as MeshModel;
            alert(`Выбран объект на позиции: [${model.position.z / 5}, ${model.position.x / 5}]`);
        } else {
			console.log('Empty!');
		}
		// this._showPickingMap(rect);
    }

	/* picking map
	_showPickingMap(rect: any): void {
		const ctx = this._canvas2!.getContext('2d')!;

		// const width = this._canvas2!.width;
		// const height = this._canvas2!.height;

		for (let y = 0; y < rect.height; y++) {
			for (let x = 0; x < rect.width; x++) {
				const pickedObject = this._sceneView.pickObject(x, y);
				if (pickedObject) ctx.fillStyle = `rgb(255,0,0)`;
				else ctx.fillStyle = `rgb(255,255,255)`;
				ctx.fillRect(x, y, 1, 1);
			}
		}
	}
	*/
}

export default SceneManager;