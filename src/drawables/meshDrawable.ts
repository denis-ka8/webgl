import Drawable, { DrawableOptions } from "./drawable";

export interface MeshDrawableOptions extends DrawableOptions {
}

class MeshDrawable extends Drawable {

	constructor(options: MeshDrawableOptions = {}) {
		super(options);
	}
}

export default MeshDrawable;