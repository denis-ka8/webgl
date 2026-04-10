import EventEmitter from "../base/eventEmitter";
import { Vec3, vec3 } from "../math/vec3";
import GLCamera from "./camera"

const MOVE_KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE'];

class CameraController extends EventEmitter {

	_camera = null; // GLCamera
	_glContext = null; // WebGL context
	_cameraSpeed = 1000;
	_rotateSpeed = 0.5;
	_keysPressed = {};
	_isMoving = false;
	_isRotating = false;
	_rotateStartCoordinates = null;

	/**
	 * @param {GLCamera} camera 
	 * @param {Object} options 
	 * options.cameraSpeed - speed of the camera movement in units per second
	 */
	constructor(camera, glContext, options = {}) {
		super();
		this._camera = camera;
		this._cameraSpeed = options.cameraSpeed || this._cameraSpeed;
		this._glContext = glContext;

		this._updateCamera = this._updateCamera.bind(this);
		this._handlers = {
			keydown: this._keyDownHandler.bind(this),
			keyup: this._keyUpHandler.bind(this),
			mousemove: this._mouseMoveHandler.bind(this),
			mousedown: this._mouseDownHandler.bind(this),
			mouseup: this._mouseUpHandler.bind(this),
		};
	}

	destructor() {
		window.removeEventListener('keydown', this._handlers.keydown);
		window.removeEventListener('keyup', this._handlers.keyup);

		const canvas = this._glContext.canvas;
		canvas.removeEventListener("mousedown", this._handlers.mousedown);
		window.removeEventListener("mousemove", this._handlers.mousemove);
		window.removeEventListener("mouseup", this._handlers.mouseup);
		super.destructor();
	}

	get camera() { return this._camera; }

	listen() {
		window.addEventListener('keydown', this._handlers.keydown);
		window.addEventListener('keyup', this._handlers.keyup);

		const canvas = this._glContext.canvas;
		canvas.addEventListener("mousedown", this._handlers.mousedown);
		window.addEventListener("mousemove", this._handlers.mousemove);
		window.addEventListener("mouseup", this._handlers.mouseup);

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
		const newPosition = this._camera.position.copy();
		const forward = Vec3.normalize(this._camera.getForwardVector());
		const right = Vec3.normalize(this._camera.getRightVector());
		let movement = vec3();

		if (this._keysPressed['KeyW']) movement = movement.add(forward.scale(-speed));
		if (this._keysPressed['KeyS']) movement = movement.add(forward.scale(speed));
		if (this._keysPressed['KeyA']) movement = movement.add(right.scale(-speed));
		if (this._keysPressed['KeyD']) movement = movement.add(right.scale(speed));
		if (this._keysPressed['KeyQ']) movement = movement.add(vec3(0, speed, 0));
		if (this._keysPressed['KeyE']) movement = movement.add(vec3(0, -speed, 0));

		this._camera.position = newPosition.add(movement);

		requestAnimationFrame(this._updateCamera);
	}

	_keyDownHandler(event) {
		const key = event.code;
		if (!MOVE_KEYS.includes(key)) return;

		this._keysPressed[key] = true;
		this._isMoving = true;
	}

	_keyUpHandler(event) {
		const key = event.code;
		if (!MOVE_KEYS.includes(key)) return;

		this._keysPressed[key] = false;
		this._isMoving = Object.values(this._keysPressed).some(Boolean);
	}

	_mouseMoveHandler(event) {
		if (!this._isRotating) return;
		const newCoordinates = {
			x: event.clientX - this._rotateStartCoordinates.x,
			y: event.clientY - this._rotateStartCoordinates.y
		};
		this._camera.xAngle = this._startAngleX - newCoordinates.x * this._rotateSpeed;
		this._camera.yAngle = this._startAngleY - newCoordinates.y * this._rotateSpeed;
		console.log(this._camera.xAngle, this._camera.yAngle);
	}

	_mouseDownHandler(event) {
		this._isRotating = true;
		this._rotateStartCoordinates = { x: event.clientX, y: event.clientY };
		this._startAngleX = this._camera.xAngle;
		this._startAngleY = this._camera.yAngle;
	}

	_mouseUpHandler(event) {
		this._isRotating = false;
		this._rotateStartCoordinates = null;
	}
}

export default CameraController;