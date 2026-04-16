import MeshModel, { MeshModelOptions } from "./meshModel";

interface CubeModelOptions extends MeshModelOptions {}

// TODO: maybe use composition instead of inheritance here
class CubeModel extends MeshModel {

	constructor(options: CubeModelOptions = {}) {
		super(options);
	}
}

export default CubeModel;