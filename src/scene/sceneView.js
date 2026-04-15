
import CameraController from "../camera/cameraController";
import CubeDrawable from "../drawables/mesh/cubeDrawable";

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
		this._sceneModel.on('objectUpdated', this._onObjectUpdated.bind(this));
		this._sceneModel.on('objectRemoved', this._onObjectRemoved.bind(this));
		this._sceneModel.on('cameraAdded', this._onCameraAdded.bind(this));

		this._drawableObjects = new Map(); // Map of modelIdCounter to drawable object

		// TODO: wip
		this._pendingUpdates = new Set(); // Set of modelIdCounter that need to be updated
		this._pendingAdditions = new Set(); // Set of modelIdCounter that need to be added
		this._pendingRemovals = new Set(); // Set of modelIdCounter that need to be removed
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

	_onObjectAdded(object) {
		const id = this._createDrawable(object);
		if (id !== null) {
			this._pendingAdditions.add(object.id);
		}
	}

	_onObjectUpdated(object) {
		this._pendingUpdates.add(object.id);
	}

	_onObjectRemoved(object) {
		this._pendingRemovals.add(object.id);
	}

	_onCameraAdded(camera) {
		// TODO: one active camera at a time for now
		this._initializeCameraController(camera);
	}

	_prepareDiffData() {
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
		const diffData = this._prepareDiffData();
		this._clearPending();

		this._renderer.updateScene(diffData);
		this._renderer.render();
	}

	resize(width, height) {
		this._glContext.canvas.width = width;
		this._glContext.canvas.height = height;
		this._renderer.setSize(width, height);
	}
}

export default SceneView;