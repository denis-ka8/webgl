import MeshDrawable, { MeshDrawableOptions } from "../meshDrawable";

export interface CubeDrawableOptions extends MeshDrawableOptions {
}

class CubeDrawable extends MeshDrawable {

	constructor(options: CubeDrawableOptions = {}) {
		super(options);
	}
}

export default CubeDrawable;