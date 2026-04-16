import Drawable, { DrawableOptions } from "./drawable";

export interface SpriteDrawableOptions extends DrawableOptions {
}

class SpriteDrawable extends Drawable {

	constructor(options: SpriteDrawableOptions = {}) {
		super(options);
	}
}

export default SpriteDrawable;