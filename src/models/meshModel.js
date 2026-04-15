import { vec3 } from "../math/vec3"
import BaseModel from "./model"

class MeshModel extends BaseModel {

	_position = vec3();

	constructor(options={}) {
		super(options);

		this._position = options.position || vec3();
	}

	get position() { return this._position; }
	set position(value) { this._position = value; }
}

export default MeshModel;