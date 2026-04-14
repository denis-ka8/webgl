import { vec3 } from "../math/vec3"
import BaseModel from "./model"

class MeshModel extends BaseModel {

	_position = vec3();

	constructor(options={}) {
		super(options);
	}
}

export default MeshModel;