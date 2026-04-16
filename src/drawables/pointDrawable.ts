import Drawable, { DrawableOptions } from "./drawable";

export interface PointDrawableOptions extends DrawableOptions {
}

class PointDrawable extends Drawable {

	constructor(options: PointDrawableOptions = {}) {
		super(options);
	}
}

export default PointDrawable;