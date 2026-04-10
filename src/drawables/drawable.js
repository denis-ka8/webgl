/**
 * Base class for drawable objects in the scene.
 * It holds a reference to a model, which contains the data needed for rendering.
 */
class Drawable {

	_model = null;

	constructor(options={}) {
		this._model = options.model;
	}

	get model() { return this._model; }
}

export default Drawable;