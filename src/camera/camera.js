import { vec3 } from "../math/vec3";

class GLCamera {

	_position = vec3(1, 1, 1);
	_target = vec3(0, 0, 0);
	_fov = 60;
	_aspect = 1;
	_near = 0.1;
	_far = 10000;

	constructor(options = {}) {
		this._position = options.position || this._position;
		this._target = options.target || this._target;
		this._fov = options.fov || this._fov;
		this._aspect = options.aspect || this._aspect;
		this._near = options.near || this._near;
		this._far = options.far || this._far;
	}

	get position() { return this._position; }
	set position(value) {
		this._position = value;
	}

	get target() { return this._target; }
	set target(value) {
		this._target = value;
	}

	get fov() { return this._fov; }
	set fov(value) {
		this._fov = value;
	}

	get aspect() { return this._aspect; }
	set aspect(value) {
		this._aspect = value;
	}

	get near() { return this._near; }
	set near(value) {
		this._near = value;
	}

	get far() { return this._far; }
	set far(value) {
		this._far = value;
	}
}

export default GLCamera;