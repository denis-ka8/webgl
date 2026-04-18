
import CameraController from "../camera/cameraController";
import Drawable from "../drawables/drawable";
import CubeDrawable from "../drawables/mesh/cubeDrawable";
import Light from "../models/light/light";
import DirectionalLight from "../models/light/directionalLight";
import PointLight from "../models/light/pointLight";
import SpotLight from "../models/light/spotLight";
import Camera from "../models/camera/camera";
import BaseModel from "../models/model";
import Color from "../utils/color";
import CubeRenderer from "../renderer/cubeRenderer";
import { vec3, Vec3 } from "../math/vec3";

const AMBIENT_LIGHT = {
	color: Color.white().toRGBArray(),
	intensity: 0.35,
}

type LightType = DirectionalLight | PointLight | SpotLight;

/**
 * SceneView is responsible for managing the camera and the list of drawables in the scene.
 * It also handles resizing and updating the view.
 */
class SceneView {

	private _sceneModel: BaseModel;
	private _renderer: CubeRenderer;
	private _glContext: WebGLRenderingContext;
	private _cameraController: CameraController | null = null;
	private _drawableObjects: Map<number, Drawable> = new Map(); // Map of modelId to drawable object
	private _pendingUpdates: Set<number> = new Set(); // Set of modelId that need to be updated
	private _pendingAdditions: Set<number> = new Set(); // Set of modelId that need to be added
	private _pendingRemovals: Set<number> = new Set(); // Set of modelId that need to be removed
	private _lightUniforms: Record<string, any> = {};
	private _cameraUniforms: Record<string, any> = {};

	constructor(sceneModel: BaseModel, renderer: CubeRenderer, glContext: WebGLRenderingContext) {
		this._sceneModel = sceneModel;
		this._renderer = renderer;
		this._glContext = glContext;

		this._sceneModel.on('objectAdded', this._onObjectAdded.bind(this));
		this._sceneModel.on('objectRemoved', this._onObjectRemoved.bind(this));
		this._sceneModel.on('cameraAdded', this._onCameraAdded.bind(this));
		this._sceneModel.on('cameraRemoved', this._onCameraRemoved.bind(this));
		this._sceneModel.on('lightAdded', this._onLightAdded.bind(this));
		this._sceneModel.on('lightRemoved', this._onLightRemoved.bind(this));

		this._drawableObjects = new Map(); // Map of modelIdCounter to drawable object

		// TODO: wip
		this._pendingUpdates = new Set(); // Set of modelIdCounter that need to be updated
		this._pendingAdditions = new Set(); // Set of modelIdCounter that need to be added
		this._pendingRemovals = new Set(); // Set of modelIdCounter that need to be removed

		this._lightUniforms = {};
		this._cameraUniforms = {};
	}

	destructor(): void {
		// TODO:
		// this._cameraController.destructor();
	}

	get model(): BaseModel { return this._sceneModel; }

	_initializeCameraController(camera: Camera): void {
		this._cameraController = new CameraController(
			camera,
			this._glContext,
			{ cameraSpeed: 10 }
		);
		this._cameraController.on("change", (camera: Camera) => {
			// TODO: if renderer
			this._renderer.updateCameraUniforms({
				uProjectionMatrix: camera.getProjectionMatrix(),
				uViewMatrix: camera.getViewMatrix(),
			});
			this._renderer.updateCameraPosition(camera.position);
		});
		this._cameraController.listen();

		this._renderer.setCamera(camera);
	}

	_createDrawable(model: BaseModel): number | null {
		let drawable;
		switch (model.constructor.name) {
			case 'CubeModel':
				drawable = new CubeDrawable({ model });
				break;
			default:
				console.warn(`Unknown model type ${model.constructor.name} added to the scene model. It will not be rendered.`);
		}
		if (drawable) {
			this._drawableObjects.set(model.id, drawable);
			return model.id;
		}
		return null;
	}

	// Scene model event handlers
	_onObjectAdded(object: BaseModel): void {
		object.on("modelUpdated", (param, value) => {
			this._onObjectUpdated(object, param, value);
		});
		const id = this._createDrawable(object);
		if (id !== null) {
			this._pendingAdditions.add(object.id);
		}
	}

	_onObjectUpdated(object: BaseModel, param: string, value: any): void {
	// 	this._pendingUpdates.add(object.id);
	}

	_onObjectRemoved(object: BaseModel): void {
		// object.off("modelUpdated");
		this._pendingRemovals.add(object.id);
	}

	_onCameraAdded(camera: Camera): void {
		// TODO: one active camera at a time for now
		this._initializeCameraController(camera);
	}

	// _onCameraUpdated(camera: Camera): void {}

	_onCameraRemoved(camera: Camera): void {}
	
	_onLightAdded(light: LightType): void {
		light.on("modelUpdated", (param, value) => {
			this._onLightUpdated(param, value);
		});

		const lightData = light.getUniformData();
		const directionalColor = lightData.color.toRGBArray();
		const direction = ("direction" in lightData) ? Vec3.normalize(lightData.direction) : vec3();
		const directionalIntensity = lightData.intensity;

		this._lightUniforms = {
			uAmbientLightColor: AMBIENT_LIGHT.color,
			uAmbientLightIntensity: AMBIENT_LIGHT.intensity,
			uDirectionalLightColor: directionalColor,
			uDirectionalLightDirection: direction,
			uDirectionalLightIntensity: directionalIntensity
		};
		this._renderer.updateLightUniforms(this._lightUniforms);
	}

	_onLightUpdated(param: string, value: any): void {
		let uniformsUpdated = true;
		switch (param) {
			case "direction":
				this._lightUniforms.uDirectionalLightDirection = Vec3.normalize(value);
				break;
			// TODO: handle other light parameters
			default:
				uniformsUpdated = false;
				break;
		}
		if (uniformsUpdated) {
			this._renderer.updateLightUniforms(this._lightUniforms);
		}
	}

	_onLightRemoved(light: Light): void {
		// light.off("modelUpdated");
	}

	_prepareObjectsDiff(): {
		additions: Drawable[];
		updates: Drawable[];
		removals: Drawable[];
	} {
		return {
			additions: Array.from(this._pendingAdditions)
				.map(id => this._drawableObjects.get(id))
				.filter((obj): obj is Drawable => obj !== undefined),
			updates: Array.from(this._pendingUpdates)
				.map(id => this._drawableObjects.get(id))
				.filter((obj): obj is Drawable => obj !== undefined),
			removals: Array.from(this._pendingRemovals)
				.map(id => this._drawableObjects.get(id))
				.filter((obj): obj is Drawable => obj !== undefined),
		};
	}

	_clearPending(): void {
		this._pendingAdditions.clear();
		this._pendingUpdates.clear();
		this._pendingRemovals.clear();
	}

	update(): void {
		const objectsDiff = this._prepareObjectsDiff();
		this._clearPending();

		this._renderer.updateSceneObjects(objectsDiff);
		this._renderer.render();
	}

	resize(width: number, height: number): void {
		this._glContext.canvas.width = width;
		this._glContext.canvas.height = height;
		this._renderer.setSize(width, height);
	}
}

export default SceneView;