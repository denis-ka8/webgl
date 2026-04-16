import Drawable, { DrawableOptions } from "./drawable";

export interface TextDrawableOptions extends DrawableOptions {
}

class TextDrawable extends Drawable {

	constructor(options: TextDrawableOptions = {}) {
		super(options);
	}
}

export default TextDrawable;