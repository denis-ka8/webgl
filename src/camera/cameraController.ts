import EventEmitter from "../utils/eventEmitter";
import { Vec3, vec3 } from "../math/vec3";
import Camera from "../models/camera/camera";

const MOVE_KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE'] as const;

type KeyType = typeof MOVE_KEYS[number];

interface CameraControllerOptions {
	cameraSpeed?: number;
}

class CameraController extends EventEmitter {

	private _camera: Camera;
	private _glContext: WebGLRenderingContext;
	private _cameraSpeed: number = 100;
	private _rotateSpeed: number = 0.5;
	private _keysPressed: Record<KeyType, boolean> = {
		KeyW: false,
		KeyA: false,
		KeyS: false,
		KeyD: false,
		KeyQ: false,
		KeyE: false
	};
	private _isMoving: boolean = false;
	private _isRotating: boolean = false;
	private _rotateStartCoordinates: { x: number; y: number };
	private _startAngleX: number = 0;
	private _startAngleY: number = 0;
	private _lastFrameTime: number | null = null;

	private _handlers: {
		keydown: (event: KeyboardEvent) => void;
		keyup: (event: KeyboardEvent) => void;
		mousemove: (event: MouseEvent) => void;
		mousedown: (event: MouseEvent) => void;
		mouseup: (event: MouseEvent) => void;
	};

	/**
	 * @param {Camera} camera 
	 * @param {Object} options 
	 * options.cameraSpeed - speed of the camera movement in units per second
	 */
	constructor(camera: Camera, glContext: WebGLRenderingContext, options: CameraControllerOptions = {}) {
		super();

		if (!camera) throw new Error('CameraController: camera is required but not provided');
		this._camera = camera;

		if (!glContext) throw new Error('CameraController: WebGL context is required but not provided');
		this._glContext = glContext;

		this._cameraSpeed = options.cameraSpeed ?? this._cameraSpeed;

		this._updateCamera = this._updateCamera.bind(this);
		this._handlers = {
			keydown: this._keyDownHandler.bind(this),
			keyup: this._keyUpHandler.bind(this),
			mousemove: this._mouseMoveHandler.bind(this),
			mousedown: this._mouseDownHandler.bind(this),
			mouseup: this._mouseUpHandler.bind(this),
		};
	}

	destructor(): void {
		window.removeEventListener('keydown', this._handlers.keydown);
		window.removeEventListener('keyup', this._handlers.keyup);

		const canvas = this._glContext.canvas;
		canvas.removeEventListener("mousedown", this._handlers.mousedown);
		window.removeEventListener("mousemove", this._handlers.mousemove);
		window.removeEventListener("mouseup", this._handlers.mouseup);
		super.destructor();
	}

	get camera(): Camera {
		return this._camera;
	}

	listen(): void {
		window.addEventListener('keydown', this._handlers.keydown);
		window.addEventListener('keyup', this._handlers.keyup);

		const canvas = this._glContext.canvas;
		canvas.addEventListener("mousedown", this._handlers.mousedown);
		window.addEventListener("mousemove", this._handlers.mousemove);
		window.addEventListener("mouseup", this._handlers.mouseup);

		// TODO: not here, this should be called in the main loop or when the camera needs to be updated
		requestAnimationFrame(this._updateCamera);
	}

	private _updateCamera(time: number): void {
		if (!this._lastFrameTime) this._lastFrameTime = time;
		const deltaTime = (time - this._lastFrameTime) / 1000;
		this._lastFrameTime = time;

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
		if (this._keysPressed['KeyQ']) movement = movement.add(vec3(0, -speed, 0));
		if (this._keysPressed['KeyE']) movement = movement.add(vec3(0, speed, 0));

		this._camera.position = newPosition.add(movement);

		this.trigger("change", this._camera);
		requestAnimationFrame(this._updateCamera);
	}

	private _keyDownHandler(event: KeyboardEvent): void {
		const key = event.code as KeyType;
		if (!MOVE_KEYS.includes(key)) return;

		this._keysPressed[key] = true;
		this._isMoving = true;
	}

	private _keyUpHandler(event: KeyboardEvent): void {
		const key = event.code as KeyType;
		if (!MOVE_KEYS.includes(key)) return;

		this._keysPressed[key] = false;
		this._isMoving = Object.values(this._keysPressed).some(Boolean);
	}

	private _mouseMoveHandler(event: MouseEvent): void {
		if (!this._isRotating) return;
		const newCoordinates = {
			x: event.clientX - this._rotateStartCoordinates.x,
			y: event.clientY - this._rotateStartCoordinates.y
		};
		this._camera.xAngle = this._startAngleX - newCoordinates.x * this._rotateSpeed;
		this._camera.yAngle = this._startAngleY - newCoordinates.y * this._rotateSpeed;
		this.trigger("change", this._camera);
	}

	private _mouseDownHandler(event: MouseEvent): void {
		this._isRotating = true;
		this._rotateStartCoordinates = { x: event.clientX, y: event.clientY };
		this._startAngleX = this._camera.xAngle;
		this._startAngleY = this._camera.yAngle;
	}

	private _mouseUpHandler(event: MouseEvent): void {
		this._isRotating = false;
	}
}

export default CameraController;