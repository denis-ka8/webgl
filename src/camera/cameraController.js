import EventEmitter from "../base/eventEmitter";

const MOVE_KEYS = ['w', 'a', 's', 'd', 'q', 'e'];

class CameraController extends EventEmitter {

	_camera = null; // GLCamera
	_step = 0.1;

	constructor(camera) {
		super();
		this._camera = camera;

		this._keyDownHandler = this._keyDownHandler.bind(this);
	}

	get camera() { return this._camera; }

	listen() {
		window.addEventListener('keydown', this._keyDownHandler);
	}

	_keyDownHandler(event) {
		const key = event.key.toLowerCase();
		if (!MOVE_KEYS.includes(key)) return;
		switch (key) {
			case 'w':
				this._camera.position.z -= this._step;
				break;
			case 's':
				this._camera.position.z += this._step;
				break;
			case 'a':
				this._camera.position.x -= this._step;
				break;
			case 'd':
				this._camera.position.x += this._step;
				break;
			case 'q':
				this._camera.position.y += this._step;
				break;
			case 'e':
				this._camera.position.y -= this._step;
				break;
		}
		this.trigger('move', this._camera.position);
	}
}

export default CameraController;