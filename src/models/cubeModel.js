import MeshModel from "./meshModel"

// TODO: maybe use composition instead of inheritance here
class CubeModel extends MeshModel {

	constructor(options={}) {
		super(options);
	}
}

export default CubeModel;