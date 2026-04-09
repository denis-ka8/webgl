import EventEmitter from "../base/eventEmitter";
import { vec3 } from "../math/vec3";
import GLCamera from "./camera"

const MOVE_KEYS = ['w', 'a', 's', 'd', 'q', 'e'];

class CameraController extends EventEmitter {

	_camera = null; // GLCamera
	_cameraSpeed = 10;
	_keysPressed = {};
	_isMoving = false;

	/**
	 * @param {GLCamera} camera 
	 * @param {Object} options 
	 * options.cameraSpeed - speed of the camera movement in units per second
	 */
	constructor(camera, options = {}) {
		super();
		this._camera = camera;
		this._cameraSpeed = options.cameraSpeed || this._cameraSpeed;

		this._updateCamera = this._updateCamera.bind(this);
		this._keyDownHandler = this._keyDownHandler.bind(this);
		this._keyUpHandler = this._keyUpHandler.bind(this);
	}

	destructor() {
		window.removeEventListener('keydown', this._keyDownHandler);
		window.removeEventListener('keyup', this._keyUpHandler);
		super.destructor();
	}

	get camera() { return this._camera; }

	listen() {
		window.addEventListener('keydown', this._keyDownHandler);
		window.addEventListener('keyup', this._keyUpHandler);

		// TODO: not here, this should be called in the main loop or when the camera needs to be updated
		requestAnimationFrame(this._updateCamera);
	}

	_updateCamera(time) {
		if (!this.lastFrameTime) this.lastFrameTime = time;
		const deltaTime = (time - this.lastFrameTime) / 1000;
		this.lastFrameTime = time;

		if (!this._isMoving) {
			requestAnimationFrame(this._updateCamera);
			return;
		}

		const speed = this._cameraSpeed * deltaTime;
		// TODO: vec3 copy method
		const newPosition = vec3(this._camera.position.x, this._camera.position.y, this._camera.position.z);

		if (this._keysPressed['w']) newPosition.z -= speed;
		if (this._keysPressed['s']) newPosition.z += speed;
		if (this._keysPressed['a']) newPosition.x -= speed;
		if (this._keysPressed['d']) newPosition.x += speed;
		if (this._keysPressed['q']) newPosition.y += speed;
		if (this._keysPressed['e']) newPosition.y -= speed;

		this._camera.position = newPosition;
		requestAnimationFrame(this._updateCamera);
	}

	_keyDownHandler(event) {
		const key = event.key.toLowerCase();
		if (!MOVE_KEYS.includes(key)) return;

		this._keysPressed[key] = true;
		this._isMoving = true;
	}

	_keyUpHandler(event) {
		const key = event.key.toLowerCase();
		if (!MOVE_KEYS.includes(key)) return;

		this._keysPressed[key] = false;
		this._isMoving = Object.values(this._keysPressed).some(Boolean);
	}
}

export default CameraController;