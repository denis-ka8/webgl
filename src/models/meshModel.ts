import { Vec3, vec3 } from "../math/vec3";
import BaseModel, { BaseModelOptions } from "./model";

export interface MeshModelOptions extends BaseModelOptions {
	position?: Vec3;
}

class MeshModel extends BaseModel {

	private _position: Vec3;

	constructor(options: MeshModelOptions = {}) {
		super(options);

		this._position = options.position || vec3();
	}

	get position(): Vec3 {
		return this._position;
	}

	set position(value: Vec3) {
		this._position = value;
	}
}

export default MeshModel;