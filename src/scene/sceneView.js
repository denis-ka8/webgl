
import GLCamera from "../camera/camera";
import CameraController from "../camera/cameraController";
import { vec3 } from "../math/vec3";

/**
 * SceneView is responsible for managing the camera and the list of drawables in the scene.
 * It also handles resizing and updating the view.
 */
class SceneView {

	constructor(sceneModel, renderer, glContext) {
		this._sceneModel = sceneModel;
		this._renderer = renderer;
		this._glContext = glContext;

		this._drawables = [];

		this._initializeCamera();
		this._renderer.setCamera(this._camera);
	}

	destructor() {
		// TODO:
		// this._cameraController.destructor();
		// this._camera.destructor();
	}

	get model() { return this._sceneModel; }

	get drawables() { return this._drawables; }

	_initializeCamera() {
		this._camera = new GLCamera({
			position: vec3(10, 10, 10),
			target: vec3(0, 0, 0),
			xAngle: 45,
			yAngle: -45,
			aspect: this._glContext.canvas.clientWidth / this._glContext.canvas.clientHeight,
		});
		this._cameraController = new CameraController(
			this._camera,
			this._glContext,
			{ cameraSpeed: 10 }
		);
		this._cameraController.listen();
	}

	addDrawable(drawable) {
		this._drawables.push(drawable);
	}

	update() {
		this._renderer.render();
	}

	resize(width, height) {
		this._glContext.canvas.width = width;
		this._glContext.canvas.height = height;
		this._renderer.setSize(width, height);
	}
}

export default SceneView;