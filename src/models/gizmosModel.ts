import { Vec3, vec3 } from "../math/vec3";
import { Ray, ray } from "../math/ray";
import BaseModel, { BaseModelOptions } from "./model";

export interface GizmosModelOptions extends BaseModelOptions {
	position?: Vec3;
}

class GizmosModel extends BaseModel {

	private _position: Vec3;
    private _points: Vec3[] = [];
    private _lines: Ray[] = [];
	// mode: 'translate'

	constructor(options: GizmosModelOptions = {}) {
		super(options);

		this._position = options.position || vec3();
		this._createTransforms();
	}

	get position(): Vec3 {
		return this._position;
	}

	set position(value: Vec3) {
		this._position = value;
		this._createTransforms();
	}

	get points(): Vec3[] {
		return this._points;
	}

	get lines(): Ray[] {
		return this._lines;
	}

	private _createTransforms(): void {
		this._points = [];
		this._points.push(
			this._position.add(vec3(3, 0, 0)),
			this._position.add(vec3(0, 3, 0)),
			this._position.add(vec3(0, 0, 3))
		);

		this._lines = [];
		this._lines.push(
			ray(this._position, vec3(1, 0, 0)),
			ray(this._position, vec3(0, 1, 0)),
			ray(this._position, vec3(0, 0, 1)),
		);
	}
}

export default GizmosModel;