import { AbstractCamera, CameraOptions } from "./abstractCamera";

class Camera extends AbstractCamera {
	constructor(options: CameraOptions = {}) {
		super(options);
	}

	getViewMatrix() {
		const forward = this.getForwardVector();
		const right = this.getRightVector();
		const up = this.getUpVector();

		const x = -right.dot(this._position);
		const y = -up.dot(this._position);
		const z = -forward.dot(this._position);

		return [
			right.x, up.x, forward.x, 0,
			right.y, up.y, forward.y, 0,
			right.z, up.z, forward.z, 0,
			x,       y,    z,         1
		];
	}

	getProjectionMatrix() {
		const f = 1 / Math.tan(this._fov * Math.PI / 360);
		const nf = 1 / (this._near - this._far);

		return [
			f / this._aspect, 0, 0, 0,
			0, f, 0, 0,
			0, 0, (this._far + this._near) * nf, -1,
			0, 0, (2 * this._far * this._near) * nf, 0
		];
	}
}

export default Camera;