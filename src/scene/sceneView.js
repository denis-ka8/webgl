
import CameraController from "../camera/cameraController";
import CubeDrawable from "../drawables/mesh/cubeDrawable";
import Color from "../utils/color";
import { Vec3 } from "../math/vec3";

const AMBIENT_LIGHT = {
	color: new Color(0.18, 0.18, 0.18).toRGBArray(),
	intensity: 0.35,
}

/**
 * SceneView is responsible for managing the camera and the list of drawables in the scene.
 * It also handles resizing and updating the view.
 */
class SceneView {

	constructor(sceneModel, renderer, glContext) {
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

	destructor() {
		// TODO:
		// this._cameraController.destructor();
	}

	get model() { return this._sceneModel; }

	_initializeCameraController(camera) {
		this._cameraController = new CameraController(
			camera,
			this._glContext,
			{ cameraSpeed: 10 }
		);
		this._cameraController.listen();
		// TODO: on change, update camera uniforms in the renderer

		this._renderer.setCamera(camera);
	}

	_createDrawable(model) {
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
	_onObjectAdded(object) {
		object.on("modelUpdated", (param, value) => {
			this._onObjectUpdated(object, param, value);
		});
		const id = this._createDrawable(object);
		if (id !== null) {
			this._pendingAdditions.add(object.id);
		}
	}

	_onObjectUpdated(object, param, value) {
	// 	this._pendingUpdates.add(object.id);
	}

	_onObjectRemoved(object) {
		// object.off("modelUpdated");
		this._pendingRemovals.add(object.id);
	}

	_onCameraAdded(camera) {
		// TODO: one active camera at a time for now
		this._initializeCameraController(camera);
	}

	// _onCameraUpdated(camera) {}

	_onCameraRemoved(camera) {}
	
	_onLightAdded(light) {
		light.on("modelUpdated", (param, value) => {
			this._onLightUpdated(param, value);
		});

		const lightData = light.getUniformData();
		const directionalColor = lightData.color.toRGBArray();
		const direction = Vec3.normalize(lightData.direction);
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

	_onLightUpdated(param, value) {
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

	_onLightRemoved(light) {
		// light.off("modelUpdated");
	}

	_prepareObjectsDiff() {
		return {
			additions: Array.from(this._pendingAdditions).map(id => this._drawableObjects.get(id)),
			updates: Array.from(this._pendingUpdates).map(id => this._drawableObjects.get(id)),
			removals: Array.from(this._pendingRemovals).map(id => this._drawableObjects.get(id))
		};
	}

	_clearPending() {
		this._pendingAdditions.clear();
		this._pendingUpdates.clear();
		this._pendingRemovals.clear();
	}

	update() {
		const objectsDiff = this._prepareObjectsDiff();
		this._clearPending();

		this._renderer.updateSceneObjects(objectsDiff);
		this._renderer.render();
	}

	resize(width, height) {
		this._glContext.canvas.width = width;
		this._glContext.canvas.height = height;
		this._renderer.setSize(width, height);
	}
}

export default SceneView;