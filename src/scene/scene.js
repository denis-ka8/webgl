/**
 * Scene class represents a collection of drawables that can be rendered together.
 */
class Scene {

	constructor(options={}) {
		this._model = options.model;
		this._drawables = [];
	}

	addDrawable(drawable) {
		this._drawables.push(drawable);
	}

	get model() { return this._model; }

	get drawables() { return this._drawables; }
}

export default Scene;