import SceneModel from "./sceneModel"
import SceneView from "./sceneView"
import CubeRenderer from "../renderer/cubeRenderer"
import CubeModel from "../models/cubeModel"
import { vec3 } from "../math/vec3"

/**
 * SceneManager is responsible for managing the scene,
 * including the scene model, view, and renderer.
 * It provides methods to initialize the scene, start and stop
 * the rendering loop, and handle resizing of the canvas.
 */
class SceneManager {
	constructor(canvas) {
		this._canvas = canvas;
		this._glContext = canvas.getContext('webgl');

		if (!this._glContext) {
			throw new Error('WebGL not supported');
		}

		this._sceneModel = new SceneModel();
		this._renderer = new CubeRenderer(this._glContext);
		this._sceneView = new SceneView(this._sceneModel, this._renderer, this._glContext);

		this._isRunning = false;
	}

	initialize() {
		// this._renderer.initialize();

		this._createCubes();
	}

	start() {
		this._isRunning = true;
		this._renderLoop();
	}

	stop() {
		this._isRunning = false;
	}

	resize(width, height) {
		this._canvas.width = width;
		this._canvas.height = height;
		this._sceneView.resize(width, height);
	}

	_renderLoop() {
		if (!this._isRunning) return;

		this._sceneView.update();

		requestAnimationFrame(() => this._renderLoop());
	}

	_createCubes() {
		const gridSpacing = 5;
		const gridOffset = gridSpacing;
		for (let row = 0; row < 3; row += 1) {
			for (let col = 0; col < 3; col += 1) {
				const x = col * gridSpacing - gridOffset;
				const z = row * gridSpacing - gridOffset;
				const cubeModel = new CubeModel({ position: vec3(x, 0, z) });
				this._sceneModel.addObject(cubeModel);
			}
		}
	}
}

export default SceneManager;