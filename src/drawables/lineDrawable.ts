import Drawable, { DrawableOptions } from "./drawable";

export interface LineDrawableOptions extends DrawableOptions {
}

class LineDrawable extends Drawable {

	constructor(options: LineDrawableOptions = {}) {
		super(options);
	}
}

export default LineDrawable;